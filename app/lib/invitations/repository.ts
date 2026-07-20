import 'server-only';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type {
  DashboardData,
  GuestbookEntry,
  InvitationData,
  InvitationStats,
  RootAccessMode,
  RsvpEntry,
  TemplateDefinition,
} from '@/app/types/invitation';
import { getAdminFirestore } from '../firebase/admin';
import { getKoreaDateKey, hashVisitorId } from '../security';
import {
  asInteger,
  asNonEmptyString,
  asOptionalString,
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from '../validation';

const DEFAULT_TEMPLATE_ID = 1;

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return typeof value === 'string' ? value : '';
}

/**
 * Firestore Admin SDK의 Timestamp 같은 클래스 인스턴스는 Server Component에서
 * Client Component로 직접 전달할 수 없습니다. 저장소 계층에서 모든 값을
 * JSON 직렬화 가능한 plain object로 바꿔 React 서버/클라이언트 경계를 안전하게
 * 통과하도록 합니다.
 */
function serializeFirestoreValue(value: unknown): unknown {
  if (value === null) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }

  if (typeof value === 'object') {
    // SDK 인스턴스가 서로 다른 모듈 경계에서 생성돼 instanceof 검사가 실패하는
    // 경우까지 처리합니다. Firestore Timestamp는 toDate()를 제공합니다.
    const timestampLike = value as { toDate?: () => unknown };

    if (typeof timestampLike.toDate === 'function') {
      const date = timestampLike.toDate();

      if (date instanceof Date) {
        return date.toISOString();
      }
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, childValue]) => childValue !== undefined)
        .map(([key, childValue]) => [
          key,
          serializeFirestoreValue(childValue),
        ]),
    );
  }

  return value;
}

function toPlainData<T>(value: unknown): T {
  return serializeFirestoreValue(value) as T;
}

export async function getInvitation(
  invitationId: string,
): Promise<InvitationData | null> {
  const normalizedId = normalizeInvitationSlug(invitationId);

  if (!isValidInvitationSlug(normalizedId)) {
    return null;
  }

  const snapshot = await getAdminFirestore()
    .collection('invitations')
    .doc(normalizedId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return toPlainData<InvitationData>(snapshot.data());
}

export async function listTemplates(): Promise<TemplateDefinition[]> {
  const snapshot = await getAdminFirestore()
    .collection('templates')
    .orderBy('sortOrder', 'asc')
    .get();

  return snapshot.docs.map((document) =>
    toPlainData<TemplateDefinition>(document.data()),
  );
}

export async function getTemplateDefinition(
  templateId: number,
): Promise<TemplateDefinition | null> {
  const snapshot = await getAdminFirestore()
    .collection('templates')
    .doc(String(templateId))
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return toPlainData<TemplateDefinition>(snapshot.data());
}

export function getAllowedPublishedTemplateIds(
  invitation: InvitationData,
  templates: TemplateDefinition[],
): number[] {
  const publishedIds = new Set(
    templates.filter((template) => template.published).map((template) => template.id),
  );

  return invitation.settings.allowedTemplateIds.filter((id) =>
    publishedIds.has(id),
  );
}

export function selectRandomTemplateId(templateIds: number[]): number | null {
  if (templateIds.length === 0) {
    return null;
  }

  return templateIds[Math.floor(Math.random() * templateIds.length)] ?? null;
}

export async function invitationSlugExists(slug: string): Promise<boolean> {
  const normalizedSlug = normalizeInvitationSlug(slug);

  if (!isValidInvitationSlug(normalizedSlug)) {
    return false;
  }

  const snapshot = await getAdminFirestore()
    .collection('invitations')
    .doc(normalizedSlug)
    .get();

  return snapshot.exists;
}

export type CreateInvitationInput = {
  slug: string;
  ownerEmail: string;
  groomName: string;
  brideName: string;
  eventDateTime: string;
  venueName: string;
};

function createInvitationDocument(input: CreateInvitationInput): InvitationData {
  const slug = normalizeInvitationSlug(input.slug);
  const groomName = asNonEmptyString(input.groomName, '신랑 이름', 30);
  const brideName = asNonEmptyString(input.brideName, '신부 이름', 30);
  const venueName = asNonEmptyString(input.venueName, '예식장 이름', 100);
  const ownerEmail = asNonEmptyString(input.ownerEmail, '소유자 이메일', 200)
    .toLowerCase();
  const normalizedDateTime = asNonEmptyString(
    input.eventDateTime,
    '예식 일시',
    40,
  );
  const date = new Date(normalizedDateTime);

  if (Number.isNaN(date.getTime())) {
    throw new Error('예식 일시가 올바르지 않습니다.');
  }

  const dateParts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value ?? '';
  const month = Number(part('month'));
  const day = Number(part('day'));
  const year = Number(part('year'));
  const dayOfWeek = part('weekday');
  const dayPeriod = part('dayPeriod');
  const hour = part('hour');
  const minute = part('minute');
  const timeLabel = `${dayPeriod} ${hour}시${minute === '00' ? '' : ` ${minute}분`}`;
  const dateLabel = `${year}년 ${month}월 ${day}일`;
  return {
    slug,
    ownerEmail,
    status: 'draft',
    couple: {
      groom: {
        name: groomName,
        fullName: groomName,
        fatherName: '',
        motherName: '',
        relationLabel: '아들',
      },
      bride: {
        name: brideName,
        fullName: brideName,
        fatherName: '',
        motherName: '',
        relationLabel: '딸',
      },
    },
    event: {
      dateTime: normalizedDateTime,
      dateLabel,
      month,
      day,
      dayOfWeek,
      timeLabel,
      venueName,
      hallName: '',
      address: '',
      latitude: 37.5665,
      longitude: 126.978,
    },
    metadata: {
      title: `${groomName}♥${brideName}, 결혼합니다!`,
      description: `${dateLabel}, 저희 두 사람의 새로운 시작에 소중한 분들을 초대합니다.`,
      siteName: `${groomName}♥${brideName} 모바일 청첩장`,
      ogImage: '/images/common/og-image.png',
    },
    settings: {
      allowedTemplateIds: [DEFAULT_TEMPLATE_ID],
      rootAccessMode: 'redirect-random',
    },
    content: {
      intro: {
        variant: 'curtain',
        duration: 1.45,
        delay: 0.2,
        autoOpen: true,
        lockScroll: false,
        eyebrow: 'Wedding',
        title: 'Invitation',
        openLabel: '터치하여 열기',
        preOpenOffset: 1,
        openingVideoSrc: '/images/signoff/signoff.mp4',
      },
      backgroundMusic: {
        variant: 'wedding',
        src: '/audio/background-music/would_you_marry_me.mp3',
        autoPlay: true,
        loop: true,
        volume: 0.5,
        showControl: true,
      },
      cover: {
        photoSrc: '/images/cover/heart-frame-photo.png',
        statement: 'Our wedding day',
        date: dateLabel,
        groomLabel: 'Groom',
        brideLabel: 'Bride',
      },
      greeting: {
        quote: '“당신은 내가 더 좋은 사람이 되고 싶게 만들어요.”',
        quoteSource: '- 영화 〈이보다 더 좋을 순 없다〉 -',
        messages: [
          '서로를 만나기 전보다',
          '더 나은 내일을 꿈꾸게 되었습니다.',
          '부족한 부분을 채워주고,',
          '잘하는 부분은 아낌없이 응원하며',
          '매일 조금씩 더 좋은 사람이 되어',
          '곁을 지키겠습니다.',
          '저희 두 사람이 하나로 거듭나는 날,',
          '함께해 주시길 바랍니다.',
        ],
        family: {
          groomParentsLabel: '부모님의',
          brideParentsLabel: '부모님의',
        },
      },
      calendar: { enabled: true },
      gallery: {
        title: '웨딩 갤러리',
        images: [
          {
            src: '/images/common/og-image.png',
            alt: `${groomName}와 ${brideName}의 대표 이미지`,
          },
        ],
      },
      location: {
        title: '오시는 길',
        mapLinks: [
          {
            id: 'naver',
            name: '네이버지도',
            href: `https://map.naver.com/p/search/${encodeURIComponent(venueName)}`,
            imageSrc: '/images/location/navermap.png',
            imageAlt: '네이버지도',
          },
          {
            id: 'google',
            name: '구글맵',
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`,
            imageSrc: '/images/location/googlemap.png',
            imageAlt: '구글맵',
          },
        ],
      },
      accounts: {
        enabled: false,
        title: '마음 전하실 곳',
        groomSectionTitle: '신랑측 계좌번호',
        brideSectionTitle: '신부측 계좌번호',
        groom: [],
        bride: [],
      },
      rsvp: {
        enabled: true,
        title: '참석여부',
        descriptionLines: [
          '참석에 부담 가지지 말아주시고,',
          '편하게 알려주세요.',
          '정성스러운 준비를 위해 참석 여부를 알려주시면 감사하겠습니다.',
        ],
        submitLabel: '참석여부 전달하기',
      },
      guestbook: {
        enabled: true,
        title: '방명록',
        description: '두 사람의 새로운 시작을 축하하는 마음을 남겨주세요.',
        submitLabel: '축하 메시지 남기기',
      },
      signoff: {
        imageSrc: '/images/signoff/bowing.png',
        imageAlt: '신랑과 신부가 인사하는 모습',
        kakaoTitle: `${groomName}♥${brideName}, 결혼합니다!`,
        kakaoDescription: '소중한 분들을 저희의 시작에 초대합니다.',
        kakaoImage: '/images/signoff/bowing.png',
        kakaoButtonLabel: '모바일 청첩장 보기',
        shareButtonLabel: '카카오톡 공유하기',
        copyButtonLabel: '청첩장 링크 복사하기',
      },
    },
  };
}

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<InvitationData> {
  const invitation = createInvitationDocument(input);

  if (!isValidInvitationSlug(invitation.slug)) {
    throw new Error('주소는 영문 소문자, 숫자, 하이픈으로 3~32자 입력하세요.');
  }

  const db = getAdminFirestore();
  const invitationRef = db.collection('invitations').doc(invitation.slug);
  const templateRef = db
    .collection('templates')
    .doc(String(DEFAULT_TEMPLATE_ID));
  const analyticsRef = invitationRef.collection('analytics').doc('summary');

  await db.runTransaction(async (transaction) => {
    const [existingInvitation, template] = await transaction.getAll(
      invitationRef,
      templateRef,
    );

    if (existingInvitation.exists) {
      throw new Error('이미 사용 중인 주소입니다.');
    }

    if (!template.exists || template.data()?.published !== true) {
      throw new Error('사용 가능한 기본 템플릿이 없습니다.');
    }

    transaction.create(invitationRef, {
      ...invitation,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.set(analyticsRef, {
      totalVisitors: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return invitation;
}

export async function updateInvitationSettings(
  invitationId: string,
  ownerEmail: string,
  settings: {
    allowedTemplateIds: number[];
    rootAccessMode: RootAccessMode;
  },
): Promise<void> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || invitation.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error('FORBIDDEN');
  }

  const templates = await listTemplates();
  const validTemplateIds = new Set(
    templates.filter((template) => template.published).map((template) => template.id),
  );
  const allowedTemplateIds = Array.from(
    new Set(
      settings.allowedTemplateIds.filter(
        (templateId) => Number.isInteger(templateId) && validTemplateIds.has(templateId),
      ),
    ),
  ).sort((a, b) => a - b);

  if (
    !['redirect-random', 'render-random', 'blocked'].includes(
      settings.rootAccessMode,
    )
  ) {
    throw new Error('루트 접속 방식이 올바르지 않습니다.');
  }

  await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .update({
      'settings.allowedTemplateIds': allowedTemplateIds,
      'settings.rootAccessMode': settings.rootAccessMode,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function recordInvitationVisit(
  invitationId: string,
  visitorId: string,
): Promise<void> {
  const normalizedVisitorId = asNonEmptyString(visitorId, '방문자 ID', 200);
  const invitation = await getInvitation(invitationId);

  if (!invitation || invitation.status === 'archived') {
    throw new Error('NOT_FOUND');
  }

  const db = getAdminFirestore();
  const invitationRef = db.collection('invitations').doc(invitation.slug);
  const visitorHash = hashVisitorId(normalizedVisitorId);
  const dateKey = getKoreaDateKey();
  const allTimeMarkerRef = invitationRef
    .collection('visitorKeys')
    .doc(`all_${visitorHash}`);
  const dailyMarkerRef = invitationRef
    .collection('visitorKeys')
    .doc(`day_${dateKey}_${visitorHash}`);
  const summaryRef = invitationRef.collection('analytics').doc('summary');
  const dailyRef = invitationRef.collection('analytics').doc(dateKey);

  await db.runTransaction(async (transaction) => {
    const [allTimeMarker, dailyMarker] = await transaction.getAll(
      allTimeMarkerRef,
      dailyMarkerRef,
    );

    if (!allTimeMarker.exists) {
      transaction.create(allTimeMarkerRef, {
        visitorHash,
        firstVisitedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(
        summaryRef,
        {
          totalVisitors: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    if (!dailyMarker.exists) {
      transaction.create(dailyMarkerRef, {
        visitorHash,
        dateKey,
        visitedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(
        dailyRef,
        {
          visitors: FieldValue.increment(1),
          dateKey,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  });
}

export type CreateRsvpInput = {
  name: unknown;
  side: unknown;
  attendance: unknown;
  guestCount: unknown;
  meal: unknown;
  phone: unknown;
  message: unknown;
};

export async function createRsvp(
  invitationId: string,
  input: CreateRsvpInput,
): Promise<void> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || !invitation.content.rsvp.enabled) {
    throw new Error('NOT_FOUND');
  }

  const side = input.side;
  const attendance = input.attendance;
  const meal = input.meal;

  if (side !== 'groom' && side !== 'bride') {
    throw new Error('신랑측 또는 신부측을 선택하세요.');
  }

  if (!['attending', 'not-attending', 'undecided'].includes(String(attendance))) {
    throw new Error('참석 여부를 선택하세요.');
  }

  if (!['yes', 'no', 'undecided'].includes(String(meal))) {
    throw new Error('식사 여부를 선택하세요.');
  }

  await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .collection('rsvps')
    .add({
      name: asNonEmptyString(input.name, '이름', 40),
      side,
      attendance,
      guestCount: asInteger(input.guestCount, '참석 인원', 0, 20),
      meal,
      phone: asOptionalString(input.phone, 30),
      message: asOptionalString(input.message, 500),
      createdAt: FieldValue.serverTimestamp(),
    });
}

export type CreateGuestbookInput = {
  name: unknown;
  message: unknown;
};

export async function createGuestbookEntry(
  invitationId: string,
  input: CreateGuestbookInput,
): Promise<void> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || !invitation.content.guestbook.enabled) {
    throw new Error('NOT_FOUND');
  }

  await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .collection('guestbook')
    .add({
      name: asNonEmptyString(input.name, '이름', 40),
      message: asNonEmptyString(input.message, '메시지', 500),
      passwordHint: '',
      isHidden: false,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listPublicGuestbookEntries(
  invitationId: string,
): Promise<GuestbookEntry[]> {
  const invitation = await getInvitation(invitationId);

  if (!invitation) {
    return [];
  }

  const snapshot = await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .collection('guestbook')
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get();

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      name: String(document.data().name ?? ''),
      message: String(document.data().message ?? ''),
      passwordHint: '',
      isHidden: Boolean(document.data().isHidden),
      createdAt: toIsoString(document.data().createdAt),
    }))
    .filter((entry) => !entry.isHidden);
}

export async function setGuestbookEntryHidden(
  invitationId: string,
  entryId: string,
  ownerEmail: string,
  isHidden: boolean,
): Promise<void> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || invitation.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error('FORBIDDEN');
  }

  await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .collection('guestbook')
    .doc(entryId)
    .update({
      isHidden,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteGuestbookEntry(
  invitationId: string,
  entryId: string,
  ownerEmail: string,
): Promise<void> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || invitation.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error('FORBIDDEN');
  }

  await getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug)
    .collection('guestbook')
    .doc(entryId)
    .delete();
}

async function getInvitationStats(invitationId: string): Promise<InvitationStats> {
  const invitationRef = getAdminFirestore()
    .collection('invitations')
    .doc(invitationId);
  const dateKey = getKoreaDateKey();
  const [summary, daily] = await Promise.all([
    invitationRef.collection('analytics').doc('summary').get(),
    invitationRef.collection('analytics').doc(dateKey).get(),
  ]);

  return {
    todayVisitors: Number(daily.data()?.visitors ?? 0),
    totalVisitors: Number(summary.data()?.totalVisitors ?? 0),
  };
}

export async function getDashboardData(
  invitationId: string,
  ownerEmail: string,
): Promise<DashboardData | null> {
  const invitation = await getInvitation(invitationId);

  if (!invitation || invitation.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    return null;
  }

  const invitationRef = getAdminFirestore()
    .collection('invitations')
    .doc(invitation.slug);
  const [templates, stats, rsvpSnapshot, guestbookSnapshot] = await Promise.all([
    listTemplates(),
    getInvitationStats(invitation.slug),
    invitationRef
      .collection('rsvps')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get(),
    invitationRef
      .collection('guestbook')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get(),
  ]);

  const rsvps: RsvpEntry[] = rsvpSnapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      name: String(data.name ?? ''),
      side: data.side === 'bride' ? 'bride' : 'groom',
      attendance:
        data.attendance === 'not-attending' || data.attendance === 'undecided'
          ? data.attendance
          : 'attending',
      guestCount: Number(data.guestCount ?? 0),
      meal: data.meal === 'yes' || data.meal === 'no' ? data.meal : 'undecided',
      phone: String(data.phone ?? ''),
      message: String(data.message ?? ''),
      createdAt: toIsoString(data.createdAt),
    };
  });

  const guestbook: GuestbookEntry[] = guestbookSnapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      name: String(data.name ?? ''),
      message: String(data.message ?? ''),
      passwordHint: String(data.passwordHint ?? ''),
      isHidden: Boolean(data.isHidden),
      createdAt: toIsoString(data.createdAt),
    };
  });

  return {
    invitation,
    templates,
    stats,
    rsvps,
    guestbook,
  };
}

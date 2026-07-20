import { readFile } from 'node:fs/promises';

const sourceUrl = new URL('./seed-data/0920.json', import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(`초기 데이터 검증 실패: ${message}`);
  }
}

function assertString(value, path) {
  assert(
    typeof value === 'string' && value.trim().length > 0,
    `${path}는 비어 있지 않은 문자열이어야 합니다.`,
  );
}

const { template, invitation } = source;

assert(
  Number.isInteger(template.id) && template.id > 0,
  'template.id는 양의 정수여야 합니다.',
);
assertString(template.name, 'template.name');
assert(
  template.published === true,
  '현재 1번 템플릿은 published=true여야 합니다.',
);
assert(invitation.slug === '0920', 'invitation.slug는 0920이어야 합니다.');
assert(
  invitation.ownerEmail === '93y0916@gmail.com',
  'ownerEmail이 요청한 Google 이메일과 다릅니다.',
);
assert(
  invitation.settings.allowedTemplateIds.includes(template.id),
  '1번 템플릿이 허용 목록에 포함되어야 합니다.',
);
assert(
  ['redirect-random', 'render-random', 'blocked'].includes(
    invitation.settings.rootAccessMode,
  ),
  'rootAccessMode가 올바르지 않습니다.',
);
assertString(invitation.couple.groom.name, 'couple.groom.name');
assertString(invitation.couple.bride.name, 'couple.bride.name');
assertString(invitation.event.dateTime, 'event.dateTime');
assert(
  !Number.isNaN(new Date(invitation.event.dateTime).getTime()),
  'event.dateTime이 ISO 날짜 형식이 아닙니다.',
);
assertString(invitation.event.venueName, 'event.venueName');
assertString(invitation.metadata.title, 'metadata.title');
assert(
  Array.isArray(invitation.content.greeting.messages),
  'greeting.messages는 배열이어야 합니다.',
);
assert(
  invitation.content.greeting.messages.length > 0,
  'greeting.messages가 비어 있습니다.',
);
assert(
  Array.isArray(invitation.content.gallery.images),
  'gallery.images는 배열이어야 합니다.',
);
assert(
  invitation.content.gallery.images.length > 0,
  'gallery.images가 비어 있습니다.',
);
assert(
  Array.isArray(invitation.content.location.mapLinks),
  'location.mapLinks는 배열이어야 합니다.',
);
assert(
  Array.isArray(invitation.content.accounts.groom),
  'accounts.groom은 배열이어야 합니다.',
);
assert(
  Array.isArray(invitation.content.accounts.bride),
  'accounts.bride는 배열이어야 합니다.',
);
assertString(invitation.content.signoff.kakaoTitle, 'signoff.kakaoTitle');

console.log('0920 초기 데이터 검증 완료');
console.log(`- 템플릿: ${template.id}번`);
console.log(`- 주소: /${invitation.slug}`);
console.log(`- 소유자: ${invitation.ownerEmail}`);
console.log(
  `- 허용 템플릿: ${invitation.settings.allowedTemplateIds.join(', ')}`,
);

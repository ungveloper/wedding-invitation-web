import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUser } from '@/app/lib/auth/session';
import { jsonError } from '@/app/lib/http';
import { createInvitation } from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';
import { asNonEmptyString } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireSessionUser();

    if (!user.email) {
      return NextResponse.json(
        { error: 'Google 계정 이메일을 확인할 수 없습니다.' },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const rawDateTime = asNonEmptyString(body.eventDateTime, '예식 일시', 40);
    const eventDateTime = /(?:Z|[+-]\d{2}:\d{2})$/.test(rawDateTime)
      ? rawDateTime
      : `${rawDateTime}:00+09:00`;
    const invitation = await createInvitation({
      slug: asNonEmptyString(body.slug, '주소', 32),
      ownerEmail: user.email,
      groomName: asNonEmptyString(body.groomName, '신랑 이름', 30),
      brideName: asNonEmptyString(body.brideName, '신부 이름', 30),
      eventDateTime,
      venueName: asNonEmptyString(body.venueName, '예식장 이름', 100),
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

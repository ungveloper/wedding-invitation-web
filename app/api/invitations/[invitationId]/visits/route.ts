import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/app/lib/http';
import { recordInvitationVisit } from '@/app/lib/invitations/repository';
import { assertSameOrigin } from '@/app/lib/security';

type RouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { invitationId } = await context.params;
    const body = (await request.json()) as { visitorId?: unknown };

    await recordInvitationVisit(invitationId, String(body.visitorId ?? ''));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

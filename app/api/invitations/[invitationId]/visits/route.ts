import { NextRequest, NextResponse } from 'next/server';
import {
  buildVisitRequestData,
  parseVisitClientData,
  resolveVisitorId,
  shouldTrackVisit,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/app/lib/analytics/request';
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
    const body = (await request.json()) as Record<string, unknown>;
    const visitorId = resolveVisitorId(request, body.visitorId);
    const clientData = parseVisitClientData(body);
    const visit = buildVisitRequestData(request, clientData);

    if (shouldTrackVisit(request)) {
      await recordInvitationVisit(invitationId, visitorId, visit);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    return jsonError(error);
  }
}

import { after, NextRequest, NextResponse } from 'next/server';
import {
  buildVisitRequestData,
  createSiteEntryClientData,
  resolveVisitorId,
  shouldTrackVisit,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/app/lib/analytics/request';
import { recordSiteVisit } from '@/app/lib/invitations/repository';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest): NextResponse {
  const visitorId = resolveVisitorId(request);
  const clientData = createSiteEntryClientData(request);
  const visit = buildVisitRequestData(request, clientData);
  const requestUrl = new URL(request.url);
  const destination = new URL(`/0920/1${requestUrl.search}`, request.url);
  const response = NextResponse.redirect(destination, 307);

  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });

  if (shouldTrackVisit(request)) {
    after(async () => {
      try {
        await recordSiteVisit(visitorId, visit);
      } catch (error) {
        console.error('사이트 방문자 집계에 실패했습니다.', error);
      }
    });
  }

  return response;
}

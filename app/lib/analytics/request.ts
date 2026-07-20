import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { VisitClientData, VisitRequestData } from '@/app/types/analytics';

export const VISITOR_COOKIE_NAME = 'mocheong_visitor_id';
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

function cleanString(value: unknown, maxLength = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanNumber(value: unknown, min: number, max: number): number | null {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    return null;
  }

  return number;
}

function getClientIp(request: NextRequest): string {
  const value =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '';

  return value.split(',')[0]?.trim().slice(0, 100) ?? '';
}

function maskIpAddress(ipAddress: string): string {
  if (!ipAddress) {
    return '';
  }

  if (ipAddress.includes(':')) {
    const parts = ipAddress.split(':').filter(Boolean);
    return `${parts.slice(0, 3).join(':')}::`;
  }

  const parts = ipAddress.split('.');

  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  return '';
}

function hashSensitiveValue(value: string, purpose: string): string {
  if (!value) {
    return '';
  }

  const salt =
    process.env.ANALYTICS_HASH_SALT ??
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    'mocheong-analytics';

  return createHash('sha256')
    .update(`${purpose}:${salt}:${value}`)
    .digest('hex')
    .slice(0, 32);
}

function decodeHeaderValue(value: string | null): string {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value).slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

function getReferrerHost(referrer: string): string {
  if (!referrer) {
    return '';
  }

  try {
    return new URL(referrer).hostname.slice(0, 200);
  } catch {
    return '';
  }
}

function getUtmValues(pageUrl: string): Pick<
  VisitRequestData,
  'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmTerm' | 'utmContent'
> {
  try {
    const url = new URL(pageUrl);

    return {
      utmSource: cleanString(url.searchParams.get('utm_source'), 120),
      utmMedium: cleanString(url.searchParams.get('utm_medium'), 120),
      utmCampaign: cleanString(url.searchParams.get('utm_campaign'), 200),
      utmTerm: cleanString(url.searchParams.get('utm_term'), 200),
      utmContent: cleanString(url.searchParams.get('utm_content'), 200),
    };
  } catch {
    return {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmTerm: '',
      utmContent: '',
    };
  }
}


export function shouldTrackVisit(request: NextRequest): boolean {
  const purpose = `${request.headers.get('purpose') ?? ''} ${
    request.headers.get('sec-purpose') ?? ''
  }`.toLowerCase();

  if (purpose.includes('prefetch')) {
    return false;
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  return !/(bot|crawler|spider|slurp|facebookexternalhit|kakaotalk-scrap|twitterbot|discordbot|googlebot|bingbot|yandex|baiduspider|headlesschrome|lighthouse)/i.test(
    userAgent,
  );
}

export function normalizeVisitorId(value: unknown): string {
  const candidate = cleanString(value, 200);

  if (/^[A-Za-z0-9_-]{16,200}$/.test(candidate)) {
    return candidate;
  }

  return randomUUID();
}

export function resolveVisitorId(
  request: NextRequest,
  bodyVisitorId?: unknown,
): string {
  const cookieVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;

  return normalizeVisitorId(cookieVisitorId || bodyVisitorId);
}

export function parseVisitClientData(value: unknown): VisitClientData {
  const input =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const templateIdValue = cleanNumber(input.templateId, 1, 100000);

  return {
    pagePath: cleanString(input.pagePath, 500),
    pageUrl: cleanString(input.pageUrl, 2000),
    referrer: cleanString(input.referrer, 2000),
    templateId:
      templateIdValue !== null && Number.isInteger(templateIdValue)
        ? templateIdValue
        : null,
    language: cleanString(input.language, 80),
    clientTimezone: cleanString(input.clientTimezone, 100),
    screenWidth: cleanNumber(input.screenWidth, 0, 100000),
    screenHeight: cleanNumber(input.screenHeight, 0, 100000),
    viewportWidth: cleanNumber(input.viewportWidth, 0, 100000),
    viewportHeight: cleanNumber(input.viewportHeight, 0, 100000),
    devicePixelRatio: cleanNumber(input.devicePixelRatio, 0, 100),
    colorDepth: cleanNumber(input.colorDepth, 0, 128),
    hardwareConcurrency: cleanNumber(input.hardwareConcurrency, 0, 1024),
    deviceMemory: cleanNumber(input.deviceMemory, 0, 1024),
    connectionType: cleanString(input.connectionType, 80),
    platform: cleanString(input.platform, 120),
  };
}

export function buildVisitRequestData(
  request: NextRequest,
  clientData: VisitClientData,
): VisitRequestData {
  const ipAddress = getClientIp(request);
  const serverReferrer = cleanString(request.headers.get('referer'), 2000);
  const effectiveReferrer = clientData.referrer || serverReferrer;
  const pageUrl = clientData.pageUrl || request.url;
  const rawIpEnabled = process.env.ANALYTICS_STORE_RAW_IP === 'true';

  return {
    ...clientData,
    pagePath: clientData.pagePath || new URL(pageUrl).pathname,
    pageUrl,
    ipAddress: rawIpEnabled ? ipAddress : '',
    ipMasked: maskIpAddress(ipAddress),
    ipHash: hashSensitiveValue(ipAddress, 'ip'),
    userAgent: cleanString(request.headers.get('user-agent'), 1000),
    serverReferrer,
    referrerHost: getReferrerHost(effectiveReferrer),
    host: cleanString(request.headers.get('host'), 200),
    continent: cleanString(request.headers.get('x-vercel-ip-continent'), 20),
    country: cleanString(request.headers.get('x-vercel-ip-country'), 20),
    region: cleanString(
      request.headers.get('x-vercel-ip-country-region'),
      100,
    ),
    city: decodeHeaderValue(request.headers.get('x-vercel-ip-city')),
    latitude: cleanString(request.headers.get('x-vercel-ip-latitude'), 30),
    longitude: cleanString(request.headers.get('x-vercel-ip-longitude'), 30),
    timezone: cleanString(request.headers.get('x-vercel-ip-timezone'), 100),
    postalCode: cleanString(request.headers.get('x-vercel-ip-postal-code'), 30),
    ...getUtmValues(pageUrl),
  };
}

export function createSiteEntryClientData(request: NextRequest): VisitClientData {
  const requestUrl = new URL(request.url);
  const pageUrl = `${requestUrl.origin}/${requestUrl.search}`;

  return {
    pagePath: '/',
    pageUrl,
    referrer: cleanString(request.headers.get('referer'), 2000),
    templateId: null,
    language: cleanString(request.headers.get('accept-language'), 120),
    clientTimezone: '',
    screenWidth: null,
    screenHeight: null,
    viewportWidth: null,
    viewportHeight: null,
    devicePixelRatio: null,
    colorDepth: null,
    hardwareConcurrency: null,
    deviceMemory: null,
    connectionType: '',
    platform: '',
  };
}

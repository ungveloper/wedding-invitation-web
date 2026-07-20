import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin');

  if (!origin) {
    return;
  }

  if (new URL(origin).host !== request.nextUrl.host) {
    throw new Error('INVALID_ORIGIN');
  }
}

export function hashVisitorId(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export function getKoreaDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

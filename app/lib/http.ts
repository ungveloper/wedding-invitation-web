import { NextResponse } from 'next/server';
import { FirebaseServerConfigurationError } from './firebase/admin';

export function jsonError(error: unknown, fallbackStatus = 400) {
  const message = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';

  if (error instanceof FirebaseServerConfigurationError) {
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (message === 'UNAUTHENTICATED') {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  if (message === 'FORBIDDEN') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  if (message === 'NOT_FOUND') {
    return NextResponse.json({ error: '대상을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (message === 'INVALID_ORIGIN') {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 });
  }

  return NextResponse.json({ error: message }, { status: fallbackStatus });
}

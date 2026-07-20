import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  getSessionUser,
} from '@/app/lib/auth/session';
import { getAdminAuth } from '@/app/lib/firebase/admin';
import { jsonError } from '@/app/lib/http';
import { assertSameOrigin } from '@/app/lib/security';
import { asNonEmptyString } from '@/app/lib/validation';

export async function GET() {
  try {
    const user = await getSessionUser();

    return NextResponse.json({
      user: user
        ? {
            uid: user.uid,
            email: user.email ?? '',
            name: user.name ?? '',
            picture: user.picture ?? '',
          }
        : null,
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { idToken?: unknown };
    const idToken = asNonEmptyString(body.idToken, 'ID 토큰', 10000);
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (nowSeconds - decodedToken.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: '로그인 시간이 오래되었습니다. 다시 로그인해 주세요.' },
        { status: 401 },
      );
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
    });
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return jsonError(error, 401);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return jsonError(error);
  }
}

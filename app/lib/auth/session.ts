import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { getAdminAuth } from '../firebase/admin';

export const SESSION_COOKIE_NAME = 'mocheong_session';
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<DecodedIdToken> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  return user;
}

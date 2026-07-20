import 'server-only';

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class FirebaseServerConfigurationError extends Error {
  constructor() {
    super(
      'Firebase Admin 환경변수가 설정되지 않았습니다. .env.example의 FIREBASE_ADMIN_* 값을 확인하세요.',
    );
    this.name = 'FirebaseServerConfigurationError';
  }
}

function getFirebaseAdminApp() {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (process.env.FIRESTORE_EMULATOR_HOST && projectId) {
    return initializeApp({ projectId });
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      projectId,
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  if (projectId || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      projectId,
      credential: applicationDefault(),
    });
  }

  throw new FirebaseServerConfigurationError();
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

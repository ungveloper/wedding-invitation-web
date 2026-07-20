import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

async function loadLocalEnvironment() {
  for (const fileName of ['.env.local', '.env']) {
    try {
      const content = await readFile(resolve(process.cwd(), fileName), 'utf8');

      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line || line.startsWith('#')) continue;

        const separatorIndex = line.indexOf('=');
        if (separatorIndex < 1) continue;

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

await loadLocalEnvironment();

function getAdminOptions() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );

  if (process.env.FIRESTORE_EMULATOR_HOST && projectId) {
    return { projectId };
  }

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      credential: cert({ projectId, clientEmail, privateKey }),
    };
  }

  if (projectId || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      projectId,
      credential: applicationDefault(),
    };
  }

  throw new Error(
    'Firebase Admin 환경변수가 없습니다. .env.example을 참고해 FIREBASE_ADMIN_* 값을 설정하세요.',
  );
}

const sourceUrl = new URL('./seed-data/0920.json', import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
const app = getApps()[0] ?? initializeApp(getAdminOptions());
const db = getFirestore(app);
const batch = db.batch();
const invitationRef = db.collection('invitations').doc(source.invitation.slug);
const templateRef = db.collection('templates').doc(String(source.template.id));
const analyticsSummaryRef = invitationRef
  .collection('analytics')
  .doc('summary');

batch.set(templateRef, {
  ...source.template,
  updatedAt: FieldValue.serverTimestamp(),
});

batch.set(invitationRef, {
  ...source.invitation,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});

batch.set(
  analyticsSummaryRef,
  {
    totalVisitors: 0,
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

await batch.commit();

console.log('Firestore 초기 데이터 등록 완료');
console.log(`- invitations/${source.invitation.slug}`);
console.log(`- templates/${source.template.id}`);
console.log('- ownerEmail:', source.invitation.ownerEmail);

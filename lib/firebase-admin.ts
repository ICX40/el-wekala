import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app;

if (!getApps().length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    if (privateKey) {
      privateKey = privateKey
        .replace(/^["'](.*)["']$/, '$1')
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // Only initialize if all valid credentials exist and format looks correct
    if (projectId && clientEmail && privateKey && privateKey.includes('BEGIN PRIVATE KEY')) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin Initialized Successfully.');
    } else {
      console.warn('Skipping Firebase Admin initialization safely during build.');
    }
  } catch (error) {
    console.warn('Firebase Admin initialization bypassed during build to prevent failure.');
  }
} else {
  app = getApps()[0];
}

export const adminDb = app ? getFirestore(app) : ({} as any);
export const adminAuth = app ? getAuth(app) : ({} as any);

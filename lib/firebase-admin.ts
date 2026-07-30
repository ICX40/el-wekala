import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

if (privateKey) {
  privateKey = privateKey
    .replace(/^["'](.*)["']$/, '$1') // Remove surrounding quotes
    .replace(/\\r\\n/g, '\n')       // Handle Windows line breaks if escaped
    .replace(/\\n/g, '\n')          // Handle escaped literal \n
    .trim();
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

if (!getApps().length) {
  try {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized Successfully.');
    } else {
      console.warn('Firebase Admin credentials missing or incomplete.');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

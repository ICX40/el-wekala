import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
const formattedPrivateKey = rawPrivateKey
  .replace(/^["'](.+)["']$/, '$1') // Removes surrounding quotes if added in Vercel
  .replace(/\\n/g, '\n');         // Converts escaped newlines to actual line breaks

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formattedPrivateKey,
};

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin Initialized Successfully.');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

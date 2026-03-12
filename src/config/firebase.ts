import * as admin from 'firebase-admin';

let initialized = false;

export function initFirebase() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn(
      '⚠️  Firebase not configured — OAuth and push notifications disabled',
    );
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    initialized = true;
    console.log('✅ Firebase initialized');
  } catch (e) {
    console.warn('⚠️  Firebase init failed:', e.message);
  }
}

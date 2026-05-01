import * as admin from "firebase-admin";

const initAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin SDK credentials missing. This is expected during some build phases if not provided.");
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1"), // Handle both \n and quotes
    }),
  });
};

const app = initAdmin();

export const adminAuth = app ? admin.auth(app) : ({} as admin.auth.Auth);
export const adminDb = app ? admin.firestore(app) : ({} as admin.firestore.Firestore);
export default admin;

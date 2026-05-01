import * as admin from "firebase-admin";

const initAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Clean up private key
  privateKey = privateKey.replace(/\\n/g, "\n").trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  }

  // Final check to ensure it looks like a PEM key before calling cert()
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("Invalid FIREBASE_PRIVATE_KEY format");
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
};

const app = initAdmin();

// Export proxies that check if app exists before calling methods
export const adminAuth = {
  verifyIdToken: (token: string) => app ? admin.auth(app).verifyIdToken(token) : Promise.reject("Admin SDK not initialized"),
  getUser: (uid: string) => app ? admin.auth(app).getUser(uid) : Promise.reject("Admin SDK not initialized"),
};

export const adminDb = app ? admin.firestore(app) : ({} as admin.firestore.Firestore);
export default admin;

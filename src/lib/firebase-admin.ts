import * as admin from "firebase-admin";

const initAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin: Missing environment variables.");
    return null;
  }

  // A more robust key cleaner
  try {
    // 1. Remove quotes if they exist
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    // 2. Replace escaped newlines with actual newlines
    // We do it twice to handle cases where it might be double-escaped
    privateKey = privateKey.replace(/\\n/g, "\n").replace(/\n/g, "\n");

    // 3. Ensure the key has proper PEM headers and footers with newlines
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
    }
    if (!privateKey.includes("-----END PRIVATE KEY-----")) {
      privateKey = `${privateKey}\n-----END PRIVATE KEY-----`;
    }

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

// Improved proxies that throw helpful errors instead of crashing
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    if (!app) throw new Error("Firebase Admin SDK not initialized. Check your FIREBASE_PRIVATE_KEY.");
    return admin.auth(app).verifyIdToken(token);
  },
  getUser: async (uid: string) => {
    if (!app) throw new Error("Firebase Admin SDK not initialized. Check your FIREBASE_PRIVATE_KEY.");
    return admin.auth(app).getUser(uid);
  },
};

export const adminDb = {
  collection: (name: string) => {
    if (!app) throw new Error("Firebase Admin SDK not initialized. Check your FIREBASE_PRIVATE_KEY.");
    return admin.firestore(app).collection(name);
  },
} as unknown as admin.firestore.Firestore;

export default admin;

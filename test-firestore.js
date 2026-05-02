const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}
privateKey = privateKey.replace(/\\n/g, "\n");

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = getFirestore(app, "default");

async function test() {
  try {
    console.log("Attempting to connect to Firestore (default)...");
    await db.collection("test").add({ ping: "pong", timestamp: new Date() });
    console.log("Success! Firestore is working.");
  } catch (error) {
    console.error("Firestore Error (default):", error.message);
    if (error.code) console.error("Error Code:", error.code);
  }
}

test();

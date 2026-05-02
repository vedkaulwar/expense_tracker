const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}
privateKey = privateKey.replace(/\\n/g, '\n');

async function listDatabases() {
  try {
    const client = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
    });

    const token = await client.getAccessToken();

    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases`, {
      headers: {
        Authorization: `Bearer ${token.token}`
      }
    });

    const data = await response.json();
    console.log("Databases in project:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Error fetching databases:", error);
  }
}

listDatabases();

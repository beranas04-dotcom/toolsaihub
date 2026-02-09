import admin from "firebase-admin";

function getPrivateKey(): string | undefined {
    const b64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    if (b64) {
        return Buffer.from(b64, "base64").toString("utf8");
    }

    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return undefined;

    return key.replace(/\\n/g, "\n");
}

export function initFirebaseAdmin() {
    if (admin.apps.length) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY_B64"
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    return admin;
}

export function getAdminDb() {
    return initFirebaseAdmin().firestore();
}

import "server-only";
import admin from "firebase-admin";

function getPrivateKey(): string | undefined {
    const b64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    if (b64) return Buffer.from(b64, "base64").toString("utf8");

    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return undefined;

    return key.replace(/\\n/g, "\n");
}

function init() {
    if (admin.apps.length) return;

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
}

export function getAdminApp() {
    init();
    return admin.app();
}

export function getAdminAuth() {
    init();
    return admin.auth();
}

export function getAdminDb() {
    init();
    return admin.firestore();
}

// ✅ Alias for old code
export function getDb() {
    return getAdminDb();
}

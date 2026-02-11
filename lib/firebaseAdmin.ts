import "server-only";
import admin from "firebase-admin";

/**
 * Supports:
 * - FIREBASE_PRIVATE_KEY_B64 (base64-encoded full private key)
 * - FIREBASE_PRIVATE_KEY (raw key with \n escaped)
 */
function getPrivateKey(): string | undefined {
    const b64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    if (b64) {
        return Buffer.from(b64, "base64").toString("utf8");
    }

    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return undefined;

    return key.replace(/\\n/g, "\n");
}

function assertEnv(projectId?: string, clientEmail?: string, privateKey?: string) {
    const missing: string[] = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY_B64 or FIREBASE_PRIVATE_KEY");

    if (missing.length) {
        throw new Error(`Missing Firebase Admin env vars: ${missing.join(", ")}`);
    }
}

export function getAdminApp() {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    assertEnv(projectId, clientEmail, privateKey);

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: projectId!,
            clientEmail: clientEmail!,
            privateKey: privateKey!,
        }),
    });

    return admin.app();
}

export function getAdminAuth() {
    getAdminApp();
    return admin.auth();
}

export function getAdminDb() {
    getAdminApp();
    return admin.firestore();
}

/**
 * Backwards-compatible aliases (so old imports don't break)
 */
export const initFirebaseAdmin = () => {
    getAdminApp();
    return admin;
};

export function getDb() {
    return getAdminDb();
}

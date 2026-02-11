const admin = require("firebase-admin");

function getPrivateKey() {
    const b64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    if (b64) {
        const decoded = Buffer.from(
            b64.trim().replace(/^"|"$/g, ""),
            "base64"
        )
            .toString("utf8")
            .trim();

        // safe debug line (no secret leakage)
        console.log("Private key first line:", decoded.split("\n")[0]);

        return decoded;
    }

    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return undefined;

    return key.replace(/\\n/g, "\n").trim();
}

function initAdmin() {
    if (admin.apps.length) return;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY(_B64)"
        );
    }
    console.log("ProjectId:", projectId);
    console.log("ClientEmail:", clientEmail);
    console.log("Has B64:", Boolean(process.env.FIREBASE_PRIVATE_KEY_B64));

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

function getDbForScripts() {
    initAdmin();
    return admin.firestore();
}

module.exports = { getDbForScripts };

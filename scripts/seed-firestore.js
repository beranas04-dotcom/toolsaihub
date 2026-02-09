// scripts/seed-firestore.js
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function getPrivateKey() {
    const key = process.env.FIREBASE_PRIVATE_KEY;
    if (!key) return undefined;
    return key.replace(/\\n/g, "\n");
}

function initAdmin() {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY"
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    return admin.app();
}

async function main() {
    initAdmin();
    const db = admin.firestore();

    const filePath = path.join(process.cwd(), "data", "tools.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const tools = JSON.parse(raw);

    if (!Array.isArray(tools)) throw new Error("data/tools.json must be an array");

    // Firestore batch limit ~500 operations
    const chunks = [];
    for (let i = 0; i < tools.length; i += 450) chunks.push(tools.slice(i, i + 450));

    let total = 0;
    for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((tool) => {
            if (!tool?.id) return;
            const ref = db.collection("tools").doc(tool.id);
            batch.set(ref, tool, { merge: true });
            total += 1;
        });
        await batch.commit();
    }

    console.log(`✅ Seeded ${total} tools into Firestore (tools collection).`);
}

main().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
});

// scripts/generate-search-index.js
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// Optional: load .env.local only on local machine
if (process.env.VERCEL !== "1") {
    try {
        require("dotenv").config({ path: ".env.local" });
    } catch { }
}

// ---------- Firebase Admin Init ----------
function initAdmin() {
    if (admin.apps.length) return;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64;

    if (!projectId || !clientEmail || !privateKeyB64) {
        throw new Error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY_B64");
    }

    const privateKey = Buffer.from(privateKeyB64, "base64").toString("utf8");

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

// ---------- Generate Search Index ----------
async function generateSearchIndex() {
    initAdmin();
    const db = admin.firestore();

    const snapshot = await db.collection("tools").get();
    const toolsFromDb = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const tools = toolsFromDb.map((tool) => ({
        id: tool.id,
        name: tool.name,
        slug: tool.slug || tool.id,
        tagline: tool.tagline || "",
        description: tool.description || tool.tagline || "",
        category: tool.category || "",
        tags: tool.tags || [],
        pricing: tool.pricing || "",
    }));

    const searchIndex = {
        tools,
        generatedAt: new Date().toISOString(),
    };

    const outputPath = path.join(process.cwd(), "public", "search-index.json");
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));

    console.log("✅ Search index generated from Firestore");
    console.log(`📊 Indexed ${tools.length} tools`);
}

generateSearchIndex().catch((error) => {
    console.error("❌ Error generating search index:", error);
    process.exit(1);
});

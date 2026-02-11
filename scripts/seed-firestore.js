// scripts/seed-firestore.js
require("dotenv").config({ path: ".env.local" });

const path = require("path");
const fs = require("fs");

// ✅ Use the unified Firebase Admin helper
const { getDbForScripts } = require("./firebaseAdminForScripts");


async function main() {
    const db = getDbForScripts();

    const filePath = path.join(process.cwd(), "data", "tools.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const tools = JSON.parse(raw);

    if (!Array.isArray(tools)) {
        throw new Error("data/tools.json must be an array");
    }

    // Firestore batch limit ~500 operations (keep safe margin)
    const chunks = [];
    for (let i = 0; i < tools.length; i += 450) chunks.push(tools.slice(i, i + 450));

    let total = 0;

    for (const chunk of chunks) {
        const batch = db.batch();

        chunk.forEach((tool) => {
            if (!tool || !tool.id) return;

            const ref = db.collection("tools").doc(String(tool.id));
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

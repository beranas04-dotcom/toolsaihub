// scripts/generate-search-index.js
const fs = require("fs");
const path = require("path");

// Optional: load .env.local only on local machine
if (process.env.VERCEL !== "1") {
    try {
        require("dotenv").config({ path: ".env.local" });
    } catch { }
}

const { getDbForScripts } = require("./firebaseAdminForScripts");

async function generateSearchIndex() {
    const db = getDbForScripts();

    const snapshot = await db.collection("tools").get();
    const toolsFromDb = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const tools = toolsFromDb.map((tool) => ({
        id: tool.id,
        name: tool.name || "",
        slug: tool.slug || tool.id,
        tagline: tool.tagline || "",
        description: tool.description || tool.tagline || "",
        category: tool.category || "",
        tags: Array.isArray(tool.tags) ? tool.tags : [],
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

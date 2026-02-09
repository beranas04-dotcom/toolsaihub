import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDbForScripts } from "./firebaseAdminForScripts";
import tools from "@/data/tools.json";

type AnyTool = Record<string, any>;

function normalizeId(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function main() {
    const db = getDbForScripts();

    const list = tools as AnyTool[];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const raw of list) {
        const id = normalizeId(String(raw.id || raw.slug || raw.name || ""));
        if (!id) {
            skipped++;
            continue;
        }

        const nowIso = new Date().toISOString();

        // ✅ data cleaned + always keep id/slug
        const data: AnyTool = {
            ...raw,
            id,
            slug: normalizeId(String(raw.slug || id)),
            status: raw.status || "published",
            updatedAt: nowIso,
            // إذا ما كايناش createdAt نخليوها تتدار أول مرة
            createdAt: raw.createdAt || undefined,
        };

        // 1) لقا doc اللي عندو نفس id (حيت doc ids random عندك)
        const q = await db.collection("tools").where("id", "==", id).limit(1).get();

        if (!q.empty) {
            const ref = q.docs[0].ref;
            const existing = q.docs[0].data() as AnyTool;

            // createdAt نخليها كما كانت
            const createdAt = existing.createdAt || data.createdAt || nowIso;

            await ref.set(
                {
                    ...data,
                    createdAt,
                },
                { merge: true }
            );

            updated++;
        } else {
            // ما لقا حتى doc => create جديد (random doc id)
            await db.collection("tools").add({
                ...data,
                createdAt: data.createdAt || nowIso,
            });
            created++;
        }
    }

    console.log("✅ Done.");
    console.log({ created, updated, skipped, total: list.length });
}

main().catch((e) => {
    console.error("❌ upsertTools failed:", e);
    process.exit(1);
});

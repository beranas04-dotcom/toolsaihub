import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import type { Tool } from "@/types";
const PAGE_SIZE = 18;

export async function getToolsPage(args: {
    page: number;
}): Promise<{
    tools: Tool[];
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
}> {
    const page = Math.max(1, Number(args.page || 1));
    const db = getDb();

    // Cursor pagination by name (stable ordering)
    // We fetch (page * PAGE_SIZE + 1) then slice.
    // Not the most efficient for huge datasets, but OK for early stage.
    const limit = page * PAGE_SIZE + 1;

    const snap = await db
        .collection("tools")
        .orderBy("name")
        .limit(limit)
        .get();

    const all = snap.docs.map((d) => d.data() as Tool).filter((t) => t?.id);

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const pageItems = all.slice(start, end);
    const hasNext = all.length > end;
    const hasPrev = page > 1;

    return {
        tools: pageItems,
        page,
        pageSize: PAGE_SIZE,
        hasNext,
        hasPrev,
    };
}

function normalizeId(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function getAllTools(): Promise<Tool[]> {
    const db = getDb();
    const snap = await db.collection("tools").orderBy("name").get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map((t) => {
            const id = t.id || normalizeId(t.slug || t.name || "");
            return { ...t, id, slug: t.slug || id } as Tool;
        });
}

export async function getToolById(idOrSlug: string): Promise<Tool | null> {
    const db = getDb();
    const key = normalizeId(idOrSlug);

    // 1) doc id = key
    const docRef = db.collection("tools").doc(key);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        const t = docSnap.data() as Tool;
        const id = t.id || key;
        return { ...t, id, slug: t.slug || id } as Tool;
    }

    // 2) fallback: slug == key (إلا كنت كاتخزن slug مختلف)
    const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
    if (!q.empty) {
        const t = q.docs[0].data() as Tool;
        const id = t.id || key;
        return { ...t, id, slug: t.slug || id } as Tool;
    }

    return null;
};
/**
 * ✅ Fetch related tools by category (fast query, no full scan)
 * Firestore doesn't do "!=" easily, so we fetch a bit more then exclude in code.
 */export async function getRelatedTools(args: {
    category: string;
    excludeId?: string;
    limit?: number;
}): Promise<Tool[]> {
    const category = (args.category || "").trim();
    const excludeId = (args.excludeId || "").trim();
    const limit = Math.max(1, Number(args.limit || 6));

    if (!category) return [];

    const db = getDb();
    const fetchN = limit + 12;

    // ✅ No orderBy -> avoids composite index requirement
    const snap = await db
        .collection("tools")
        .where("category", "==", category)
        .limit(fetchN)
        .get();

    const list = snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map((t) => {
            const id = t.id || normalizeId(t.slug || t.name || "");
            return { ...t, id, slug: t.slug || id } as Tool;
        })
        .filter((t) => (excludeId ? t.id !== excludeId : true))
        // ✅ Sort in code for nice stable UI
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        .slice(0, limit);

    return list;
}
export async function getRecentlyUpdatedTools(limit = 6): Promise<Tool[]> {
    const db = getDb();

    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .orderBy("updatedAt", "desc")
        .limit(limit)
        .get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map((t) => {
            const id = t.id || normalizeId(t.slug || t.name || "");
            return { ...t, id, slug: t.slug || id } as Tool;
        });
}




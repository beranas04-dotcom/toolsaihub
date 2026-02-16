// lib/toolsRepo.ts
import "server-only";
import type { Tool } from "@/types";
import { getDb } from "@/lib/firebaseAdmin";

const PAGE_SIZE = 18;

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function normalizeTool(t: Tool): Tool {
    const id = t.id || normalizeId(t.slug || t.name || "");
    return { ...t, id, slug: t.slug || id } as Tool;
}

function byName(a: any, b: any) {
    return String(a?.name || "").localeCompare(String(b?.name || ""));
}

/**
 * ✅ PUBLIC: published tools only
 * (We avoid composite indexes by NOT using orderBy with where,
 * and instead sort in code after fetching.)
 */
export async function getAllTools(): Promise<Tool[]> {
    const db = getDb();

    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map(normalizeTool)
        .sort(byName);
}

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

    // fetch all published, then paginate in code (safe + no index needed)
    const all = await getAllTools();

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return {
        tools: all.slice(start, end),
        page,
        pageSize: PAGE_SIZE,
        hasNext: all.length > end,
        hasPrev: page > 1,
    };
}

export async function getToolById(idOrSlug: string): Promise<Tool | null> {
    const db = getDb();
    const key = normalizeId(idOrSlug);

    // try direct doc id
    const docRef = db.collection("tools").doc(key);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        const t = normalizeTool(docSnap.data() as Tool);
        if (t.status !== "published") return null; // ✅ hide drafts publicly
        return t;
    }

    // fallback by slug
    const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
    if (!q.empty) {
        const t = normalizeTool(q.docs[0].data() as Tool);
        if (t.status !== "published") return null; // ✅ hide drafts publicly
        return t;
    }

    return null;
}

/**
 * ✅ Public related tools: no change needed (already avoids orderBy indexes)
 * But we also hide drafts by filtering status in code.
 */
export async function getRelatedTools(args: {
    category: string;
    excludeId?: string;
    limit?: number;
}): Promise<Tool[]> {
    const category = (args.category || "").trim();
    const excludeId = (args.excludeId || "").trim();
    const limit = Math.max(1, Number(args.limit || 6));
    if (!category) return [];

    const db = getDb();

    const snap = await db
        .collection("tools")
        .where("category", "==", category)
        .limit(limit + 30)
        .get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map(normalizeTool)
        .filter((t) => t.status === "published") // ✅ hide drafts
        .filter((t) => (excludeId ? t.id !== excludeId : true))
        .sort(byName)
        .slice(0, limit);
}

export async function getRecentlyUpdatedTools(limit = 6): Promise<Tool[]> {
    const db = getDb();

    // already published only
    const fetchN = Math.max(30, limit + 24);

    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .limit(fetchN)
        .get();

    const list = snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map(normalizeTool)
        .sort((a, b) => {
            const ad = Date.parse(a.updatedAt || (a as any).lastUpdated || a.createdAt || "0");
            const bd = Date.parse(b.updatedAt || (b as any).lastUpdated || b.createdAt || "0");
            return bd - ad;
        })
        .slice(0, limit);

    return list;
}

/**
 * =========================
 * ✅ ADMIN HELPERS (see drafts too)
 * =========================
 */

export async function getAllToolsAdmin(): Promise<Tool[]> {
    const db = getDb();
    const snap = await db.collection("tools").get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map(normalizeTool)
        .sort(byName);
}

export async function getToolsPageAdmin(args: {
    page: number;
}): Promise<{
    tools: Tool[];
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
}> {
    const page = Math.max(1, Number(args.page || 1));
    const all = await getAllToolsAdmin();

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return {
        tools: all.slice(start, end),
        page,
        pageSize: PAGE_SIZE,
        hasNext: all.length > end,
        hasPrev: page > 1,
    };
}

export async function getToolByIdAdmin(idOrSlug: string): Promise<Tool | null> {
    const db = getDb();
    const key = normalizeId(idOrSlug);

    const docRef = db.collection("tools").doc(key);
    const docSnap = await docRef.get();
    if (docSnap.exists) return normalizeTool(docSnap.data() as Tool);

    const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
    if (!q.empty) return normalizeTool(q.docs[0].data() as Tool);

    return null;
}

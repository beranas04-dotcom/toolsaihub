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

function toIsoString(v: any): string | undefined {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString();
    if (typeof v?.toDate === "function") return v.toDate().toISOString(); // Firestore Timestamp
    return String(v);
}

function normalizeTool(t: any): Tool {
    const id = t.id || normalizeId(t.slug || t.name || "");

    // ✅ force all “date-like” fields to string (Client Components safe)
    const createdAt = toIsoString(t.createdAt);
    const updatedAt = toIsoString(t.updatedAt);
    const lastUpdated = toIsoString(t.lastUpdated);

    const sponsorUntil = toIsoString(t.sponsorUntil);
    const lastClickAt = toIsoString(t.lastClickAt);

    return {
        ...t,
        id,
        slug: t.slug || id,

        createdAt,
        updatedAt,
        lastUpdated,

        sponsorUntil,
        lastClickAt,

        // ✅ arrays must be plain arrays
        tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
        features: Array.isArray(t.features) ? t.features.map(String) : [],
        useCases: Array.isArray(t.useCases) ? t.useCases.map(String) : [],
        pros: Array.isArray(t.pros) ? t.pros.map(String) : [],
        cons: Array.isArray(t.cons) ? t.cons.map(String) : [],
        screenshots: Array.isArray(t.screenshots) ? t.screenshots.map(String) : [],
    } as Tool;
}

function byName(a: any, b: any) {
    return String(a?.name || "").localeCompare(String(b?.name || ""));
}

/** ✅ Sponsored helpers */
function isSponsorActive(t: Tool): boolean {
    const anyT = t as any;
    if (anyT?.sponsored !== true) return false;

    const until = anyT?.sponsorUntil;
    if (!until) return true;

    const ts = Date.parse(String(until));
    return Number.isFinite(ts) ? ts > Date.now() : true;
}

function toolRank(t: Tool): number {
    const anyT = t as any;
    if (isSponsorActive(t)) return 0; // sponsored first
    if (anyT?.featured) return 1;
    if (anyT?.verified) return 2;
    return 3;
}

function byBusinessOrder(a: Tool, b: Tool) {
    const ar = toolRank(a);
    const br = toolRank(b);
    if (ar !== br) return ar - br;

    // inside sponsored: sponsorPriority desc
    const ap = Number((a as any)?.sponsorPriority || 0);
    const bp = Number((b as any)?.sponsorPriority || 0);
    if (ap !== bp) return bp - ap;

    return byName(a, b);
}

/**
 * ✅ PUBLIC: published tools only
 * (Avoid composite indexes: no orderBy + where)
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
        .sort(byBusinessOrder);
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
        if ((t as any).status !== "published") return null;
        return t;
    }

    // fallback by slug
    const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
    if (!q.empty) {
        const t = normalizeTool(q.docs[0].data() as Tool);
        if ((t as any).status !== "published") return null;
        return t;
    }

    return null;
}

/**
 * ✅ Related tools: published only, sorted business order
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
        .filter((t) => (t as any).status === "published")
        .filter((t) => (excludeId ? t.id !== excludeId : true))
        .sort(byBusinessOrder)
        .slice(0, limit);
}

export async function getRecentlyUpdatedTools(limit = 6): Promise<Tool[]> {
    const db = getDb();
    const fetchN = Math.max(30, limit + 24);

    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .limit(fetchN)
        .get();

    return snap.docs
        .map((d) => d.data() as Tool)
        .filter((t) => t && (t.id || t.slug || t.name))
        .map(normalizeTool)
        .sort((a, b) => {
            const ad = Date.parse((a as any).updatedAt || (a as any).lastUpdated || (a as any).createdAt || "0");
            const bd = Date.parse((b as any).updatedAt || (b as any).lastUpdated || (b as any).createdAt || "0");
            if (bd !== ad) return bd - ad;
            return byBusinessOrder(a, b);
        })
        .slice(0, limit);
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
        .sort(byBusinessOrder);
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

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function cleanUndefined(obj: Record<string, any>) {
    // Firestore ماكيقبلش undefined
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out;
}

function toStringArray(v: any): string[] {
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String).map((x) => x.trim()).filter(Boolean);

    // allow "a,b,c" or "a\nb\nc"
    const s = String(v).trim();
    if (!s) return [];
    return s
        .split(/[\n,]+/)
        .map((x) => x.trim())
        .filter(Boolean);
}

function toIsoOrNull(v: any): string | null {
    const s = String(v || "").trim();
    if (!s) return null;
    const ms = Date.parse(s);
    if (!Number.isFinite(ms)) return null;
    return new Date(ms).toISOString();
}

async function requireAdminFromBearer(req: Request) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
        const err: any = new Error("UNAUTHENTICATED");
        err.code = 401;
        throw err;
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = (decoded.email || "").toLowerCase();

    // isAdmin() كيرجع true إلا الإيميل admin
    if (
        !email ||
        !isAdmin({ uid: decoded.uid, email, displayName: null, photoURL: null, isAdmin: false })
    ) {
        const err: any = new Error("FORBIDDEN");
        err.code = 403;
        throw err;
    }

    return decoded;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminFromBearer(req);

        const id = normalizeId(params.id);
        const body = (await req.json().catch(() => ({}))) as Record<string, any>;

        // ✅ accept both keys, but store in `website` + keep `websiteUrl` optionally if you want
        if ("websiteUrl" in body && !("website" in body)) body.website = body.websiteUrl;

        const allowed = [
            "name",
            "tagline",
            "description",
            "category",
            "tags",
            "pricing",
            "pricingDetails",
            "website",
            "websiteUrl",
            "affiliateUrl",
            "affiliateNetwork",
            "affiliateNotes",
            "logo",
            "screenshots",
            "featured",
            "verified",
            "freeTrial",
            "status",
            "features",
            "pros",
            "cons",
            "useCases",
            "reviewCount",
            "rating",
            "lastUpdated",
            "reviewedBy",
            "metaTitle",
            "metaDescription",
            "adminNotes",

            // ✅ SPONSORED (NEW)
            "sponsored",
            "sponsorLabel",
            "sponsorPriority",
            "sponsorUntil",
        ];

        const updates: Record<string, any> = {};
        for (const k of allowed) {
            if (k in body) updates[k] = body[k];
        }

        // ✅ normalize arrays (باش ديما يبقاو arrays ف Firestore)
        if ("tags" in updates) updates.tags = toStringArray(updates.tags);
        if ("screenshots" in updates) updates.screenshots = toStringArray(updates.screenshots);
        if ("features" in updates) updates.features = toStringArray(updates.features);
        if ("pros" in updates) updates.pros = toStringArray(updates.pros);
        if ("cons" in updates) updates.cons = toStringArray(updates.cons);
        if ("useCases" in updates) updates.useCases = toStringArray(updates.useCases);

        // ✅ normalize sponsorUntil => ISO or null
        if ("sponsorUntil" in updates) updates.sponsorUntil = toIsoOrNull(updates.sponsorUntil);

        // ✅ types safety (optional but pro)
        if ("sponsorPriority" in updates) {
            const n = Number(updates.sponsorPriority || 0);
            updates.sponsorPriority = Number.isFinite(n) ? n : 0;
        }
        if ("sponsored" in updates) updates.sponsored = Boolean(updates.sponsored);

        updates.updatedAt = new Date().toISOString();

        const db = getAdminDb();
        await db.collection("tools").doc(id).set(cleanUndefined(updates), { merge: true });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const code =
            e?.code || (e?.message === "FORBIDDEN" ? 403 : e?.message === "UNAUTHENTICATED" ? 401 : 500);

        const msg = code === 401 ? "UNAUTHENTICATED" : code === 403 ? "FORBIDDEN" : e?.message || "Server error";
        return NextResponse.json({ error: msg }, { status: code });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminFromBearer(req);

        const id = normalizeId(params.id);

        const db = getAdminDb();
        await db.collection("tools").doc(id).delete();

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const code =
            e?.code || (e?.message === "FORBIDDEN" ? 403 : e?.message === "UNAUTHENTICATED" ? 401 : 500);

        const msg = code === 401 ? "UNAUTHENTICATED" : code === 403 ? "FORBIDDEN" : e?.message || "Server error";
        return NextResponse.json({ error: msg }, { status: code });
    }
}

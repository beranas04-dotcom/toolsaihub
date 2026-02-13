import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function toStringArray(v: any): string[] | undefined {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return v.map((x) => String(x || "").trim()).filter(Boolean);
    const s = String(v || "").trim();
    if (!s) return [];
    return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function toStringArrayLower(v: any): string[] | undefined {
    const arr = toStringArray(v);
    if (!arr) return arr;
    const seen = new Set<string>();
    const out: string[] = [];
    for (const x of arr) {
        const k = x.toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            out.push(x);
        }
    }
    return out;
}

function toBool(v: any): boolean | undefined {
    if (v === undefined) return undefined;
    if (typeof v === "boolean") return v;
    if (v === "true") return true;
    if (v === "false") return false;
    return Boolean(v);
}

function normalizeStatus(v: any): "draft" | "pending" | "published" | "rejected" | undefined {
    if (v === undefined) return undefined;
    const s = String(v || "").trim().toLowerCase();
    if (s === "draft" || s === "pending" || s === "published" || s === "rejected") return s;
    return undefined;
}

/**
 * GET one tool (admin only)
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminUser();

        const id = normalizeId(params.id);
        const db = getAdminDb();
        const snap = await db.collection("tools").doc(id).get();

        if (!snap.exists) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

        const data = snap.data() as any;

        // Normalize common field naming differences for UI
        const tool = {
            id: snap.id,
            ...data,
            slug: data.slug || snap.id,
            websiteUrl: data.websiteUrl || data.website || "",
            website: data.website || data.websiteUrl || "",
        };

        return NextResponse.json({ ok: true, tool });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const code = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}

/**
 * PATCH tool (admin only)
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminUser();

        const id = normalizeId(params.id);
        const body = await req.json().catch(() => ({}));

        const updates: any = {};

        // Text fields
        if ("name" in body) updates.name = String(body.name || "").trim();
        if ("tagline" in body) updates.tagline = String(body.tagline || "").trim();
        if ("description" in body) updates.description = String(body.description || "").trim();
        if ("category" in body) updates.category = String(body.category || "").trim();

        // Links (support both naming styles)
        if ("websiteUrl" in body || "website" in body) {
            const v = String(body.websiteUrl || body.website || "").trim();
            updates.websiteUrl = v;
            updates.website = v; // keep both so your UI never breaks
        }
        if ("affiliateUrl" in body) updates.affiliateUrl = String(body.affiliateUrl || "").trim();
        if ("logo" in body) updates.logo = String(body.logo || "").trim();

        // Arrays
        if ("tags" in body) updates.tags = toStringArrayLower(body.tags) || [];
        if ("features" in body) updates.features = toStringArray(body.features) || [];
        if ("pros" in body) updates.pros = toStringArray(body.pros) || [];
        if ("cons" in body) updates.cons = toStringArray(body.cons) || [];
        if ("useCases" in body) updates.useCases = toStringArray(body.useCases) || [];

        // Flags
        if ("featured" in body) updates.featured = toBool(body.featured) ?? false;
        if ("verified" in body) updates.verified = toBool(body.verified) ?? false;
        if ("freeTrial" in body) updates.freeTrial = toBool(body.freeTrial) ?? false;

        // Pricing/status
        if ("pricing" in body) updates.pricing = String(body.pricing || "").trim();
        if ("status" in body) {
            const st = normalizeStatus(body.status);
            if (!st) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            updates.status = st;
        }

        updates.updatedAt = new Date().toISOString();

        const db = getAdminDb();
        await db.collection("tools").doc(id).set(updates, { merge: true });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const code = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}

/**
 * DELETE tool (admin only)
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminUser();

        const id = normalizeId(params.id);
        const db = getAdminDb();
        await db.collection("tools").doc(id).delete();

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const code = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}

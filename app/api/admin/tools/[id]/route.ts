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

    if (!email || !isAdmin({ uid: decoded.uid, email, displayName: null, photoURL: null, isAdmin: false })) {
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

        // ✅ accept both keys, but store in `website`
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
        ];



        const updates: Record<string, any> = {};
        for (const k of allowed) {
            if (k in body) updates[k] = body[k];
        }

        updates.updatedAt = new Date().toISOString();

        const db = getAdminDb();
        await db.collection("tools").doc(id).set(cleanUndefined(updates), { merge: true });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const code = e?.code || (e?.message === "FORBIDDEN" ? 403 : e?.message === "UNAUTHENTICATED" ? 401 : 500);
        const msg =
            code === 401 ? "UNAUTHENTICATED" : code === 403 ? "FORBIDDEN" : (e?.message || "Server error");
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
        const code = e?.code || (e?.message === "FORBIDDEN" ? 403 : e?.message === "UNAUTHENTICATED" ? 401 : 500);
        const msg =
            code === 401 ? "UNAUTHENTICATED" : code === 403 ? "FORBIDDEN" : (e?.message || "Server error");
        return NextResponse.json({ error: msg }, { status: code });
    }
}

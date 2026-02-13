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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminUser();

        const id = normalizeId(params.id);
        const body = (await req.json().catch(() => ({}))) as Record<string, any>;

        const updates: Record<string, any> = {};

        // ✅ accept both keys, but store in `website`
        if ("websiteUrl" in body && !("website" in body)) body.website = body.websiteUrl;

        const allowed = [
            "name",
            "tagline",
            "description",
            "category",
            "tags",
            "pricing",
            "website",          // ✅ important
            "affiliateUrl",
            "logo",
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
        ];

        for (const k of allowed) {
            if (k in body) updates[k] = body[k];
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

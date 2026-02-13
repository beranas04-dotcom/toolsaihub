import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
    "name",
    "tagline",
    "description",
    "category",
    "tags",
    "pricing",
    "website",
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
    "slug",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireAdminUser();

        const id = params.id; // ✅ IMPORTANT: keep raw docId, no normalize
        const body = await req.json().catch(() => ({}));

        const updates: Record<string, any> = {};

        for (const k of ALLOWED_FIELDS) {
            if (k in body) updates[k as AllowedField] = (body as any)[k];
        }

        // Backward compatibility if old UI sends websiteUrl
        if ("websiteUrl" in body && !("website" in body)) {
            updates.website = (body as any).websiteUrl;
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

        const id = params.id; // ✅ keep raw docId
        const db = getAdminDb();

        await db.collection("tools").doc(id).delete();

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const code = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}

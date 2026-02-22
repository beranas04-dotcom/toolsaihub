import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const ref = adminDb.collection("categories").doc(params.id);
    const body = await req.json();

    const update = {
        name: String(body.name || "").trim(),
        description: String(body.description || ""),
        icon: String(body.icon || ""),
        order: Number.isFinite(body.order) ? Number(body.order) : 999,
        featured: Boolean(body.featured),
        seo: {
            metaTitle: String(body?.seo?.metaTitle || ""),
            metaDescription: String(body?.seo?.metaDescription || ""),
            ogImage: String(body?.seo?.ogImage || ""),
        },
        updatedAt: Date.now(),
    };

    await ref.set(update, { merge: true });
    const doc = await ref.get();
    return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    await adminDb.collection("categories").doc(params.id).delete();
    return NextResponse.json({ ok: true });
}
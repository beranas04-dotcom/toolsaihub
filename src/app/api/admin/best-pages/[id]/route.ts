import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const ref = adminDb.collection("bestPages").doc(params.id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const ref = adminDb.collection("bestPages").doc(params.id);
    const body = await req.json();

    // sanitize minimal
    const update = {
        title: String(body.title || "").trim(),
        subtitle: String(body.subtitle || ""),
        intro: String(body.intro || ""),
        published: Boolean(body.published),
        seo: {
            metaTitle: String(body?.seo?.metaTitle || ""),
            metaDescription: String(body?.seo?.metaDescription || ""),
            ogImage: String(body?.seo?.ogImage || ""),
        },
        toolIds: Array.isArray(body.toolIds) ? body.toolIds.map(String) : [],
        faq: Array.isArray(body.faq)
            ? body.faq.map((x: any) => ({ q: String(x?.q || ""), a: String(x?.a || "") }))
            : [],
        updatedAt: Date.now(),
    };

    await ref.set(update, { merge: true });
    const doc = await ref.get();
    return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    // optional: you can disable delete later
    await adminDb.collection("bestPages").doc(params.id).delete();
    return NextResponse.json({ ok: true });
}
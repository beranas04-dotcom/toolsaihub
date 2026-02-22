import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
    const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const body = await req.json();

    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim();
    if (!slug || !name) {
        return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    const existing = await adminDb.collection("categories").where("slug", "==", slug).limit(1).get();
    if (!existing.empty) return NextResponse.json({ error: "slug already exists" }, { status: 409 });

    const now = Date.now();
    const doc = {
        slug,
        name,
        description: String(body.description || ""),
        icon: String(body.icon || ""),
        order: Number.isFinite(body.order) ? Number(body.order) : 999,
        featured: Boolean(body.featured),
        seo: {
            metaTitle: String(body?.seo?.metaTitle || name),
            metaDescription: String(body?.seo?.metaDescription || ""),
            ogImage: String(body?.seo?.ogImage || ""),
        },
        createdAt: now,
        updatedAt: now,
    };

    const ref = await adminDb.collection("categories").add(doc);
    return NextResponse.json({ id: ref.id, item: { id: ref.id, ...doc } });
}
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
    const snap = await adminDb.collection("bestPages").orderBy("updatedAt", "desc").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const body = await req.json();

    const slug = String(body.slug || "").trim();
    const title = String(body.title || "").trim();

    if (!slug || !title) {
        return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
    }

    // enforce unique slug
    const existing = await adminDb.collection("bestPages").where("slug", "==", slug).limit(1).get();
    if (!existing.empty) {
        return NextResponse.json({ error: "slug already exists" }, { status: 409 });
    }

    const now = Date.now();
    const doc = {
        slug,
        title,
        subtitle: "",
        intro: "",
        seo: { metaTitle: title, metaDescription: "", ogImage: "" },
        toolIds: [],
        faq: [],
        published: false,
        createdAt: now,
        updatedAt: now,
    };

    const ref = await adminDb.collection("bestPages").add(doc);
    return NextResponse.json({ id: ref.id, item: { id: ref.id, ...doc } });
}
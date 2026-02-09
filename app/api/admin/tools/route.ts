import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

function normalizeId(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const name = String(body?.name || "").trim();
        const slug = normalizeId(String(body?.slug || name));
        const websiteUrl = String(body?.websiteUrl || "").trim();
        const category = String(body?.category || "").trim();

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (!websiteUrl) return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
        if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

        const tool = {
            id: slug,
            name,
            slug,
            websiteUrl,
            tagline: String(body?.tagline || "").trim(),
            description: String(body?.description || "").trim(),
            category,
            pricing: String(body?.pricing || "freemium"),
            tags: Array.isArray(body?.tags) ? body.tags : [],
            status: body?.status === "published" ? "published" : "draft",
            featured: Boolean(body?.featured),
            updatedAt: new Date().toISOString(),
        };

        const db = getAdminDb();
        await db.collection("tools").doc(slug).set(tool, { merge: true });

        return NextResponse.json({ ok: true, id: slug });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

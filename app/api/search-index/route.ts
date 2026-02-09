import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = getDb();

        const snap = await db.collection("tools").orderBy("name").limit(2000).get();

        const tools = snap.docs
            .map((d) => d.data() as any)
            .filter((t) => t?.id && t?.name)
            .map((t) => ({
                id: t.id,
                slug: t.slug || t.id,
                name: t.name || "",
                tagline: t.tagline || "",
                description: t.description || t.tagline || "",
                category: t.category || "",
                tags: Array.isArray(t.tags) ? t.tags : [],
                pricing: t.pricing || "",
                logo: t.logo || "",
            }));

        return NextResponse.json({ tools, generatedAt: new Date().toISOString() });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to load search index" },
            { status: 500 }
        );
    }
}

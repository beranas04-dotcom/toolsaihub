import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
    const db = getAdminDb();

    const snap = await db.collection("tools").get();
    const tools = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: d.id,
            name: data.name || "",
            slug: data.slug || d.id,
            tagline: data.tagline || "",
            description: data.description || "",
            category: data.category || "",
            tags: data.tags || [],
            pricing: data.pricing || "",
        };
    });

    return NextResponse.json({ tools });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

function safeHttpUrl(u?: string | null) {
    if (!u) return null;
    try {
        const url = new URL(u);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return null;
    } catch {
        return null;
    }
}

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;

    // legacy: /api/out?url=https://...
    const rawUrl = sp.get("url");
    const direct = safeHttpUrl(rawUrl);
    if (direct) {
        const res = NextResponse.redirect(direct, { status: 302 });
        res.headers.set("Cache-Control", "no-store");
        return res;
    }

    // new: /api/out?toolId=...
    const toolIdOrSlug = (sp.get("toolId") || sp.get("id") || "").trim();
    if (!toolIdOrSlug) {
        return new NextResponse("Missing toolId (or valid url) parameter", { status: 400 });
    }

    const key = normalizeId(toolIdOrSlug);
    const db = getDb();

    // 1) doc id = key
    const docSnap = await db.collection("tools").doc(key).get();
    let tool: any = docSnap.exists ? docSnap.data() : null;

    // 2) fallback: slug == key
    if (!tool) {
        const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
        if (!q.empty) tool = q.docs[0].data();
    }

    if (!tool) return new NextResponse("Tool not found", { status: 404 });

    const target =
        safeHttpUrl(tool?.affiliateUrl) ||
        safeHttpUrl(tool?.website) ||
        safeHttpUrl(tool?.websiteUrl); // (احتياط: إلى كنتي كتستعمل websiteUrl فشي بلاصة)

    if (!target) return new NextResponse("Tool has no valid website/affiliateUrl", { status: 400 });

    const res = NextResponse.redirect(target, { status: 302 });
    res.headers.set("Cache-Control", "no-store");
    return res;
}

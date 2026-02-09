import toolsData from "@/data/tools.json";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;

    // Old param (optional)
    const rawUrl = sp.get("url");
    const url = safeHttpUrl(rawUrl);

    // New params
    const toolIdOrSlug = (sp.get("toolId") || sp.get("id") || "").trim();

    // 1) Keep old behavior if url is provided
    if (url) {
        const res = NextResponse.redirect(url, { status: 302 });
        res.headers.set("Cache-Control", "no-store");
        return res;
    }

    // 2) Otherwise redirect by toolId OR slug
    if (!toolIdOrSlug) {
        return new NextResponse("Missing toolId (or valid url) parameter", { status: 400 });
    }

    const key = toolIdOrSlug.toLowerCase();

    const tool = (toolsData as any[]).find((t) => {
        const id = String(t?.id || "").toLowerCase();
        const slug = String(t?.slug || "").toLowerCase();
        return id === key || slug === key;
    });

    if (!tool) {
        return new NextResponse("Tool not found", { status: 404 });
    }

    const target = safeHttpUrl(tool?.affiliateUrl) || safeHttpUrl(tool?.website);

    if (!target) {
        return new NextResponse("Tool has no valid website/affiliateUrl", { status: 400 });
    }

    const res = NextResponse.redirect(target, { status: 302 });
    res.headers.set("Cache-Control", "no-store");
    return res;
}

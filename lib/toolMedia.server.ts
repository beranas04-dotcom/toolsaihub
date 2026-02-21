// lib/toolMedia.server.ts
import "server-only";
import type { Tool } from "@/types";
import { getDb } from "@/lib/firebaseAdmin";

function safeHttpUrl(u?: string) {
    if (!u) return "";
    if (u.startsWith("/")) return u; // local public path
    try {
        const url = new URL(u);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return "";
    } catch {
        return "";
    }
}

function getSiteUrl(tool: Tool) {
    return (
        safeHttpUrl((tool as any).websiteUrl) ||
        safeHttpUrl((tool as any).website) ||
        safeHttpUrl((tool as any).affiliateUrl) ||
        ""
    );
}

function getDomain(tool: Tool) {
    const site = getSiteUrl(tool);
    if (!site || site.startsWith("/")) return "";
    try {
        return new URL(site).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

function faviconUrl(domain: string) {
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

function extractMetaImage(html: string) {
    const og =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
    if (og?.[1]) return og[1];

    const tw =
        html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i);
    return tw?.[1] || "";
}

async function fetchOgImage(siteUrl: string): Promise<string> {
    if (!siteUrl || siteUrl.startsWith("/")) return "";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
        const res = await fetch(siteUrl, {
            signal: controller.signal,
            headers: { "user-agent": "Mozilla/5.0 (compatible; toolsiahub/1.0)" },
            redirect: "follow",
            cache: "no-store",
        });

        if (!res.ok) return "";
        const html = await res.text();

        const metaImg = extractMetaImage(html);
        if (!metaImg) return "";

        const abs = new URL(metaImg, siteUrl).toString();
        return safeHttpUrl(abs);
    } catch {
        return "";
    } finally {
        clearTimeout(timeout);
    }
}

export async function withAutoMedia(tool: Tool): Promise<Tool> {
    const out: any = { ...(tool as any) };

    const site = getSiteUrl(tool);
    const domain = getDomain(tool);

    // ✅ logo: existing OR favicon fallback OR keep as-is
    out.logo = safeHttpUrl(out.logo) || faviconUrl(domain) || out.logo;

    // ✅ heroImage: existing OR og:image
    if (!safeHttpUrl(out.heroImage)) {
        const ogImage = await fetchOgImage(site);
        if (ogImage) out.heroImage = ogImage;
    }

    // ✅ optional caching into Firestore
    if (process.env.TOOL_MEDIA_CACHE === "1") {
        try {
            const db = getDb();
            const docId = String(out.id || out.slug || "");
            if (docId) {
                const patch: any = {};
                if (out.logo && !(tool as any).logo) patch.logo = out.logo;
                if (out.heroImage && !(tool as any).heroImage) patch.heroImage = out.heroImage;

                if (Object.keys(patch).length) {
                    await db.collection("tools").doc(docId).set(patch, { merge: true });
                }
            }
        } catch {
            // never break the page
        }
    }

    return JSON.parse(JSON.stringify(out)) as Tool;
}

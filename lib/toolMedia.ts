// lib/toolMedia.ts
import type { Tool } from "@/types";

function isImageLike(url: string) {
    const u = url.toLowerCase();

    // allow data images + known logo endpoints
    if (u.startsWith("data:image/")) return true;
    if (u.includes("logo.clearbit.com/")) return true;
    if (u.includes("www.google.com/s2/favicons")) return true;

    // common image extensions (with or without query)
    return (
        u.endsWith(".png") ||
        u.endsWith(".jpg") ||
        u.endsWith(".jpeg") ||
        u.endsWith(".webp") ||
        u.endsWith(".svg") ||
        u.endsWith(".ico") ||
        u.includes(".png?") ||
        u.includes(".jpg?") ||
        u.includes(".jpeg?") ||
        u.includes(".webp?") ||
        u.includes(".svg?") ||
        u.includes(".ico?")
    );
}

export function safeUrl(u?: string): string {
    if (!u) return "";
    const raw = String(u).trim();
    if (!raw) return "";

    // local public path
    if (raw.startsWith("/")) return raw;

    // protocol-relative
    if (raw.startsWith("//")) return `https:${raw}`;

    // data image
    if (raw.startsWith("data:image/")) return raw;

    // if missing protocol but looks like domain/path => prefix https://
    const missingProto =
        !raw.startsWith("http://") &&
        !raw.startsWith("https://") &&
        raw.includes(".");
    const withProto = missingProto ? `https://${raw}` : raw;

    try {
        const url = new URL(withProto);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return "";
    } catch {
        return "";
    }
}

export function getToolSite(tool: Tool): string {
    return (
        safeUrl((tool as any).websiteUrl) ||
        safeUrl((tool as any).website) ||
        safeUrl((tool as any).affiliateUrl) ||
        ""
    );
}

export function getToolDomain(tool: Tool): string {
    const site = getToolSite(tool);
    if (!site || site.startsWith("/")) return "";
    try {
        return new URL(site).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

export function clearbitLogo(tool: Tool): string {
    const domain = getToolDomain(tool);
    if (!domain) return "";
    return `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
}

export function faviconFallback(tool: Tool): string {
    const domain = getToolDomain(tool);
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

export function resolveLogo(tool: Tool): string {
    const rawLogo = safeUrl((tool as any).logo);

    // if admin provided a good direct image URL, use it
    if (rawLogo && isImageLike(rawLogo)) return rawLogo;

    // otherwise auto logo from domain
    const cb = clearbitLogo(tool);
    if (cb) return cb;

    const fav = faviconFallback(tool);
    if (fav) return fav;

    return "/logo.svg";
}

export function resolveHero(tool: Tool): string {
    return safeUrl((tool as any).heroImage);
}

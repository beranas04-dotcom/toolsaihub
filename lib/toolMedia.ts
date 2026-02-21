// lib/toolMedia.ts
import type { Tool } from "@/types";

export function safeUrl(u?: string) {
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

export function getToolSite(tool: Tool) {
    return (
        safeUrl((tool as any).websiteUrl) ||
        safeUrl((tool as any).website) ||
        safeUrl((tool as any).affiliateUrl) ||
        ""
    );
}

export function getToolDomain(tool: Tool) {
    const site = getToolSite(tool);
    if (!site || site.startsWith("/")) return "";
    try {
        return new URL(site).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

export function faviconFallback(tool: Tool) {
    const domain = getToolDomain(tool);
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

export function resolveLogo(tool: Tool) {
    return safeUrl((tool as any).logo) || faviconFallback(tool) || "/logo.svg";
}

export function resolveHero(tool: Tool) {
    return safeUrl((tool as any).heroImage);
}

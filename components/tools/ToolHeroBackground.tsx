// components/tools/ToolHeroBackground.tsx
import type { Tool } from "@/types";

function safeUrl(u?: string) {
    if (!u) return "";
    try {
        const url = new URL(u);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return "";
    } catch {
        return "";
    }
}

function getDomainFromTool(tool: Tool) {
    const website = safeUrl((tool as any).websiteUrl || (tool as any).website || "");
    const aff = safeUrl((tool as any).affiliateUrl || "");
    const src = website || aff;
    if (!src) return "";
    try {
        return new URL(src).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

// ✅ Safe favicon fallback (no config needed)
function faviconUrl(domain: string) {
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

function categoryKey(tool: Tool) {
    return String((tool as any).category || "")
        .toLowerCase()
        .trim();
}

// ✅ Abstract gradient fallback per category (safe + attractive)
function gradientClassForCategory(cat: string) {
    if (cat.includes("audio") || cat.includes("voice") || cat.includes("speech")) {
        return "bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-blue-500/20";
    }
    if (cat.includes("video")) {
        return "bg-gradient-to-r from-fuchsia-500/20 via-purple-500/10 to-indigo-500/20";
    }
    if (cat.includes("design") || cat.includes("image")) {
        return "bg-gradient-to-r from-rose-500/20 via-orange-500/10 to-amber-500/20";
    }
    if (cat.includes("seo") || cat.includes("writing") || cat.includes("content")) {
        return "bg-gradient-to-r from-emerald-500/20 via-lime-500/10 to-green-500/20";
    }
    if (cat.includes("automation") || cat.includes("productivity")) {
        return "bg-gradient-to-r from-teal-500/20 via-slate-500/10 to-zinc-500/20";
    }
    // default
    return "bg-gradient-to-r from-primary/20 via-muted/10 to-primary/10";
}

export default function ToolHeroBackground({ tool }: { tool: Tool }) {
    const hero = safeUrl((tool as any).heroImage);
    const logoProvided = safeUrl((tool as any).logo);

    const domain = getDomainFromTool(tool);
    const logoFallback = faviconUrl(domain);

    const logo = logoProvided || logoFallback;
    const cat = categoryKey(tool);
    const gradientCls = gradientClassForCategory(cat);

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            {/* 1) Hero image blur if available */}
            {hero ? (
                <img
                    src={hero}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-25"
                    loading="lazy"
                />
            ) : (
                // 2) Gradient fallback if no hero
                <div className={`absolute inset-0 ${gradientCls}`} />
            )}

            {/* Keep text readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />

            {/* Soft vignette */}
            <div className="absolute inset-0 bg-radial-fade" />

            {/* Logo watermark (logo OR favicon fallback) */}
            {logo ? (
                <img
                    src={logo}
                    alt=""
                    className="absolute -right-10 top-6 h-52 w-52 object-contain opacity-[0.10] blur-[0.5px] rotate-6"
                    loading="lazy"
                />
            ) : null}

            {/* Mask fade edges */}
            <div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage: "radial-gradient(70% 70% at 70% 30%, black 40%, transparent 75%)",
                    maskImage: "radial-gradient(70% 70% at 70% 30%, black 40%, transparent 75%)",
                }}
            />
        </div>
    );
}

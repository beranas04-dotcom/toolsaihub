"use client";

import Link from "next/link";
import type { Tool } from "@/types";
import { trackEvent } from "@/lib/analytics";
import ToolLogo from "@/components/tools/ToolLogo";
import { resolveLogo } from "@/lib/toolMedia";

function getDomain(url?: string) {
    if (!url) return "";
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return url.replace(/^https?:\/\//, "").split("/")[0];
    }
}

export default function ToolCard({ tool }: { tool: Tool }) {
    // support both field names (website vs websiteUrl)
    const website = (tool as any).websiteUrl || (tool as any).website || "";
    const affiliateUrl = (tool as any).affiliateUrl || "";

    const hasOut = Boolean(affiliateUrl || website);
    const domain = getDomain(website || affiliateUrl);

    // ✅ Sponsored logic (pro)
    const sponsorUntil = (tool as any).sponsorUntil;
    const sponsorActive =
        (tool as any).sponsored === true &&
        (!sponsorUntil || (Number.isFinite(Date.parse(String(sponsorUntil))) && Date.parse(String(sponsorUntil)) > Date.now()));

    const isSponsored = sponsorActive;
    const showFeatured = Boolean((tool as any).featured && !isSponsored);


    // ✅ route.ts supports toolId OR slug
    // ✅ add ref=card for analytics
    const outUrl = `/api/out?toolId=${encodeURIComponent((tool as any).slug || tool.id)}&ref=card`;


    return (

        <div className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
            {/* HEADER */}
            <div className="flex items-start gap-4">
                <ToolLogo
                    src={resolveLogo(tool)}
                    website={(tool as any).websiteUrl || tool.website || tool.affiliateUrl}
                    alt={tool.name}
                    className="w-12 h-12 rounded-lg object-contain bg-muted/40 p-2"
                />


                {isSponsored ? (
                    <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        ⭐ {(tool as any).sponsorLabel || "Sponsored"}
                    </span>
                ) : showFeatured ? (
                    <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Featured
                    </span>
                ) : null}

                <div className="min-w-0 flex-1">
                    <Link href={`/tools/${tool.slug || tool.id}`} className="block">
                        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {tool.name}
                        </h3>
                    </Link>

                    {/* Pricing تحت العنوان */}
                    {tool.pricing ? (
                        <div className="mt-2">
                            <span className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-1 text-[11px] font-medium leading-none">
                                <span className="truncate">{tool.pricing}</span>
                            </span>
                        </div>
                    ) : null}

                    {tool.tagline ? (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {tool.tagline}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* FEATURES */}
            {(tool as any).features?.length ? (
                <ul className="text-xs text-muted-foreground mt-4 space-y-1">
                    {(tool as any).features.slice(0, 3).map((f: string) => (
                        <li key={f} className="line-clamp-1">
                            • {f}
                        </li>
                    ))}
                </ul>
            ) : null}

            {/* TAGS */}
            {(tool as any).tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-4">
                    {(tool as any).tags.slice(0, 4).map((tag: string) => (
                        <span
                            key={tag}
                            className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}

            {/* FOOTER */}
            <div className="mt-auto pt-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {domain ? (
                        <span className="truncate max-w-[180px]">🔗 {domain}</span>
                    ) : (
                        <span className="truncate max-w-[180px]">No website</span>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/tools/${(tool as any).slug || tool.id}`}
                        className="flex-1 text-center text-sm font-medium border border-border rounded-lg py-2 hover:bg-muted transition"
                    >
                        View Details
                    </Link>

                    {hasOut ? (
                        <a
                            href={outUrl}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            onClick={() =>
                                trackEvent("outbound_click", {
                                    tool_id: tool.id,
                                    tool_name: (tool as any).name,
                                    category: (tool as any).category || "",
                                    destination: "out",
                                    source: "card",
                                })
                            }
                            className="text-center text-sm font-semibold bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:opacity-90 transition"
                        >
                            Visit
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

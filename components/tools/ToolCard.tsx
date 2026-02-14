"use client";

import Link from "next/link";
import type { Tool } from "@/types";
import { trackEvent } from "@/lib/analytics";
import ToolLogo from "@/components/tools/ToolLogo";

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
    const hasOut = Boolean(tool.affiliateUrl || tool.website);
    const domain = getDomain(tool.website || tool.affiliateUrl);
    const outUrl = `/api/out?toolId=${encodeURIComponent(tool.slug || tool.id)}`;

    return (
        <div className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col h-full">
            {/* HEADER */}
            <div className="flex items-start gap-4">
                <ToolLogo
                    src={tool.logo}
                    website={tool.website || tool.affiliateUrl}
                    alt={tool.name}
                    className="w-12 h-12 rounded-lg object-contain bg-muted/40 p-2"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <Link href={`/tools/${tool.slug || tool.id}`} className="min-w-0">
                            <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                {tool.name}
                            </h3>
                        </Link>

                        {tool.pricing ? (
                            <span className="shrink-0 text-[11px] font-medium bg-muted px-2 py-1 rounded-full max-w-[160px] truncate whitespace-nowrap">
                                {tool.pricing}
                            </span>
                        ) : null}
                    </div>

                    {tool.tagline ? (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {tool.tagline}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* FEATURES */}
            {tool.features?.length ? (
                <ul className="text-xs text-muted-foreground mt-4 space-y-1">
                    {tool.features.slice(0, 3).map((f) => (
                        <li key={f} className="line-clamp-1">
                            • {f}
                        </li>
                    ))}
                </ul>
            ) : null}

            {/* TAGS */}
            {tool.tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-4">
                    {tool.tags.slice(0, 4).map((tag) => (
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {domain ? (
                        <span className="truncate max-w-[180px]">🔗 {domain}</span>
                    ) : (
                        <span className="truncate max-w-[180px]">No website</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/tools/${tool.slug || tool.id}`}
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
                                    tool_name: tool.name,
                                    category: tool.category || "",
                                    destination: "out",
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

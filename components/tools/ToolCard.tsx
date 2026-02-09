"use client";

import Link from "next/link";
import { Tool } from "@/types";
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

    return (
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition flex flex-col h-full">
            {/* Top */}
            <div className="flex items-start gap-3">
                <ToolLogo
                    src={tool.logo}
                    website={tool.website || tool.affiliateUrl}
                    alt={tool.name}
                    className="w-10 h-10 rounded object-contain bg-muted/30 p-1"
                />


                <div className="min-w-0 flex-1">
                    <Link href={`/tools/${tool.slug || tool.id}`} className="block group">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {tool.name}
                        </h3>

                        {tool.tagline ? (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {tool.tagline}
                            </p>
                        ) : null}
                    </Link>
                </div>
            </div>

            {/* Features */}
            {tool.features?.length ? (
                <ul className="text-xs text-muted-foreground mt-3 list-disc pl-4 space-y-1">
                    {tool.features.slice(0, 3).map((f) => (
                        <li key={f} className="line-clamp-1">
                            {f}
                        </li>
                    ))}
                </ul>
            ) : null}

            {/* Tags (limit 6) */}
            {tool.tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-3">
                    {tool.tags.slice(0, 6).map((tag) => (
                        <span
                            key={tag}
                            className="text-[11px] px-2 py-1 rounded-full border border-border bg-muted text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}

            {/* Bottom */}
            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    {tool.pricing ? (
                        <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                            {tool.pricing}
                        </span>
                    ) : null}

                    {tool.website ? (
                        <span className="text-xs text-muted-foreground truncate">
                            🔗 {getDomain(tool.website)}
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href={`/tools/${tool.slug || tool.id}`}
                        className="text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                    >
                        Open →
                    </Link>

                    {hasOut ? (
                        <Link
                            href={`/api/out?toolId=${tool.id}`}
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
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Visit →
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

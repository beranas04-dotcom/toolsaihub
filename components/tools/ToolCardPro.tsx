"use client";

import Link from "next/link";
import type { Tool } from "@/types";
import { resolveLogo } from "@/lib/toolMedia";
import SponsoredBadge from "@/components/tools/SponsoredBadge";

function Pill({
    children,
    variant = "neutral",
}: {
    children: React.ReactNode;
    variant?: "primary" | "neutral" | "success" | "warn";
}) {
    const cls =
        variant === "primary"
            ? "bg-primary/10 text-primary"
            : variant === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : variant === "warn"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                    : "bg-muted text-muted-foreground";

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}
        >
            {children}
        </span>
    );
}

function isSponsoredActive(tool: any) {
    if (!tool?.sponsored) return false;
    if (!tool?.sponsorUntil) return true;

    const ms = Date.parse(String(tool.sponsorUntil));
    if (!Number.isFinite(ms)) return false;

    return ms > Date.now();
}

export default function ToolCardPro({ tool }: { tool: Tool }) {
    const detailsHref = `/tools/${tool.slug || tool.id}`;

    const hasVisit = Boolean(
        (tool as any).affiliateUrl || (tool as any).website || (tool as any).websiteUrl
    );

    const isSponsored = isSponsoredActive(tool);
    const showFeatured = Boolean((tool as any).featured && !isSponsored);

    const outUrl = `/api/out?toolId=${encodeURIComponent(
        (tool as any).slug || tool.id
    )}&ref=card_pro`;

    const logoSrc = resolveLogo(tool);
    const fallback = (tool.name || "?").charAt(0).toUpperCase();

    return (
        <div className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-md transition">
            {/* Title + tagline */}
            <Link href={detailsHref} className="block">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        {/* Logo */}
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={tool.name}
                                className="w-10 h-10 rounded-lg object-contain bg-muted/40 p-1.5"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/logo.svg";
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-sm font-bold">
                                {fallback}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="font-semibold text-lg leading-tight group-hover:text-primary transition line-clamp-1">
                                    {tool.name}
                                </div>

                                {isSponsored ? (
                                    <SponsoredBadge label={(tool as any).sponsorLabel} />
                                ) : null}
                            </div>

                            {tool.tagline ? (
                                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {tool.tagline}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {tool.freeTrial ? <Pill variant="success">Free trial</Pill> : null}
                    </div>
                </div>
            </Link>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
                {tool.category ? <Pill variant="primary">{tool.category}</Pill> : null}
                {tool.pricing ? <Pill>{tool.pricing}</Pill> : null}

                {showFeatured ? <Pill variant="warn">Featured</Pill> : null}

                {tool.verified ? <Pill>Verified</Pill> : null}

                {isSponsored && (tool as any).sponsorTier ? (
                    <Pill variant="warn">{String((tool as any).sponsorTier)}</Pill>
                ) : null}
            </div>

            {/* Tags */}
            {(tool.tags || []).length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {(tool.tags || []).slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-[11px] px-2 py-1 rounded-full border border-border bg-background text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}

            {/* Disclosure */}
            {isSponsored ? (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
                    Sponsored listing
                </div>
            ) : null}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
                <Link
                    href={detailsHref}
                    className="text-sm font-semibold text-muted-foreground hover:text-primary transition"
                >
                    Open →
                </Link>

                {hasVisit ? (
                    <a
                        href={outUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                    >
                        🚀 Try Now
                    </a>
                ) : (
                    <span className="text-sm text-muted-foreground">No website</span>
                )}
            </div>
        </div>
    );
}
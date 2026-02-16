"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import type { Tool } from "@/types";

function getDomain(url?: string) {
    if (!url) return "";
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return url.replace(/^https?:\/\//, "").split("/")[0];
    }
}

export default function FeaturedToolsCarousel({ tools }: { tools: Tool[] }) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const items = useMemo(() => {
        // keep only valid tools
        return (tools || []).filter((t) => t?.id && t?.name);
    }, [tools]);

    if (!items.length) return null;

    function scrollByCard(direction: "left" | "right") {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>("[data-card]");
        const delta = (card?.offsetWidth || 360) + 16; // card width + gap
        el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
    }

    return (
        <section className="mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Featured AI Tools</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Hand-picked tools worth trying right now.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => scrollByCard("left")}
                        className="h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                        aria-label="Scroll featured tools left"
                        title="Scroll left"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByCard("right")}
                        className="h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                        aria-label="Scroll featured tools right"
                        title="Scroll right"
                    >
                        →
                    </button>

                    <Link
                        href="/tools"
                        className="ml-2 hidden sm:inline-flex items-center text-sm font-semibold text-primary hover:underline"
                    >
                        View all →
                    </Link>
                </div>
            </div>

            {/* SEO note: keep real <a> links inside cards */}
            <div className="relative">
                <div
                    ref={scrollerRef}
                    className="
            flex gap-4 overflow-x-auto pb-2
            scroll-smooth
            snap-x snap-mandatory
            [scrollbar-width:thin]
          "
                    aria-label="Featured tools carousel"
                >
                    {items.map((t) => {
                        const slug = t.slug || t.id;
                        const outUrl = t.affiliateUrl || t.website || "";
                        const domain = getDomain(t.website || t.affiliateUrl);

                        return (
                            <article
                                key={t.id}
                                data-card
                                className="
                  snap-start
                  min-w-[280px] sm:min-w-[340px] lg:min-w-[360px]
                  rounded-2xl border border-border bg-card
                  p-6
                  hover:border-primary/60 hover:shadow-md transition
                "
                            >
                                <header className="min-w-0">
                                    <h3 className="text-lg font-semibold leading-snug">
                                        <Link href={`/tools/${slug}`} className="hover:text-primary transition-colors">
                                            {t.name}
                                        </Link>
                                    </h3>

                                    {t.pricing ? (
                                        <div className="mt-2">
                                            <span className="inline-flex max-w-full items-center rounded-full bg-muted px-2 py-1 text-[11px] font-medium leading-none">
                                                <span className="truncate">{t.pricing}</span>
                                            </span>
                                        </div>
                                    ) : null}

                                    {t.tagline ? (
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {t.tagline}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Explore details, pricing, and use-cases.
                                        </p>
                                    )}
                                </header>


                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    {t.category ? (
                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                                            {t.category}
                                        </span>
                                    ) : null}

                                    {t.verified ? (
                                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                                            Verified
                                        </span>
                                    ) : null}

                                    {t.freeTrial ? (
                                        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                            Free trial
                                        </span>
                                    ) : null}
                                </div>

                                {t.features?.length ? (
                                    <ul className="mt-4 text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                        {t.features.slice(0, 3).map((f) => (
                                            <li key={f} className="line-clamp-1">
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                <footer className="mt-6 flex items-center justify-between gap-3">
                                    <div className="text-xs text-muted-foreground truncate">
                                        {domain ? `🔗 ${domain}` : " "}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/tools/${slug}`}
                                            className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border hover:bg-accent transition text-sm font-semibold"
                                        >
                                            Details
                                        </Link>

                                        {outUrl ? (
                                            <Link
                                                href={`/api/out?toolId=${t.id}`}
                                                target="_blank"
                                                rel="sponsored noopener noreferrer"
                                                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-95 transition text-sm font-semibold"
                                            >
                                                Visit
                                            </Link>
                                        ) : null}
                                    </div>
                                </footer>
                            </article>
                        );
                    })}
                </div>

                {/* small hint on mobile */}
                <p className="mt-3 text-xs text-muted-foreground sm:hidden">
                    Swipe horizontally to browse featured tools.
                </p>
            </div>
        </section>
    );
}

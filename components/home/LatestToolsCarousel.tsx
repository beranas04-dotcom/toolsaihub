"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import type { Tool } from "@/types";
import ToolCard from "@/components/tools/ToolCard";

export default function LatestToolsCarousel({ tools }: { tools: Tool[] }) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const items = useMemo(() => {
        const safe = (tools || []).filter((t) => t?.id && t?.name);
        // Latest tools = خذ غير 12 ولا 16 باش تبان خفيفة
        return safe.slice(0, 12);
    }, [tools]);

    if (!items.length) return null;

    function scrollByCard(direction: "left" | "right") {
        const el = scrollerRef.current;
        if (!el) return;

        const card = el.querySelector<HTMLElement>("[data-card]");
        const gap = 16; // gap-4
        const delta = (card?.offsetWidth || 340) + gap;

        el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
    }

    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-display">Latest AI Tools</h2>
                        <p className="text-muted-foreground mt-2">
                            Discover the newest additions to our directory.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollByCard("left")}
                            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent transition"
                            aria-label="Scroll latest tools left"
                            title="Scroll left"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByCard("right")}
                            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent transition"
                            aria-label="Scroll latest tools right"
                            title="Scroll right"
                        >
                            →
                        </button>

                        <Link
                            href="/tools?sort=new"
                            className="ml-2 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* fade edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent z-10" />

                    <div
                        ref={scrollerRef}
                        className="
              flex gap-4 overflow-x-auto pb-2
              scroll-smooth
              snap-x snap-mandatory
              [scrollbar-width:thin]
            "
                        aria-label="Latest tools carousel"
                    >
                        {items.map((tool) => (
                            <div
                                key={tool.id}
                                data-card
                                className="snap-start w-[300px] sm:w-[360px] shrink-0"
                            >
                                <ToolCard tool={tool} />
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground sm:hidden">
                        Swipe horizontally to browse the latest tools.
                    </p>
                </div>
            </div>
        </section>
    );
}

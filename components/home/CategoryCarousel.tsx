"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CategoryCard = {
    key: string;
    title: string;
    description: string;
    count: number;
    slug: string;
    icon: string;
    image: string;
};

export default function CategoryCarousel({ categories }: { categories: CategoryCard[] }) {

    // Infinite illusion: duplicate list 3 times and keep scroll in the middle
    const triple = useMemo(() => [...categories, ...categories, ...categories], [categories]);

    const trackRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        // start in the middle copy
        requestAnimationFrame(() => {
            const oneSetWidth = el.scrollWidth / 3;
            el.scrollLeft = oneSetWidth;
            setReady(true);
        });

        const onScroll = () => {
            const oneSetWidth = el.scrollWidth / 3;
            const left = el.scrollLeft;

            // if user is close to edges, jump back to middle (no visible "end")
            const threshold = 80;

            if (left < threshold) {
                el.scrollLeft = left + oneSetWidth;
            } else if (left > oneSetWidth * 2 - threshold) {
                el.scrollLeft = left - oneSetWidth;
            }
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [triple.length]);

    const scrollByCards = (dir: "left" | "right") => {
        const el = trackRef.current;
        if (!el) return;

        // scroll roughly one card
        const card = el.querySelector<HTMLElement>("[data-card]");
        const step = card ? card.offsetWidth + 20 : 420;

        el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    };

    return (
        <section className="py-16 bg-muted/30 border-y border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Browse AI Tools by Category</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            Find the best AI tools for your exact needs — from writing and design to coding, marketing, and productivity. Each category is carefully curated to help you save time and get results faster.
                        </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollByCards("left")}
                            className="h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                            aria-label="Scroll categories left"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByCards("right")}
                            className="h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                            aria-label="Scroll categories right"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className="relative">
                    {/* soft edge fade (looks premium) */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10" />

                    <div
                        ref={trackRef}
                        className={[
                            "flex gap-5 overflow-x-auto pb-2",
                            "scroll-smooth",
                            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                            "snap-x snap-mandatory",
                            ready ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                    >
                        {triple.map((c, idx) => (
                            <Link
                                key={`${c.key}-${idx}`}
                                href={`/categories/${c.slug}`}
                                aria-label={`Browse ${c.title} AI tools`}
                                data-card
                                className={[
                                    "snap-start shrink-0",
                                    "w-[320px] sm:w-[360px] lg:w-[420px]",
                                    "rounded-2xl border border-border bg-card overflow-hidden",
                                    "hover:shadow-lg hover:border-primary/50 transition",
                                    "group",
                                ].join(" ")}
                            >
                                <div className="relative h-[180px] sm:h-[200px] lg:h-[220px]">
                                    <Image
                                        src={c.image}
                                        alt={`${c.title} category`}
                                        fill
                                        className="object-cover"
                                        priority={false}
                                    />
                                    {/* overlays for readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-sm">
                                        <span>{c.icon}</span>
                                        <span className="font-medium">{c.title}</span>
                                    </div>
                                    <div className="absolute top-4 right-4 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                                        {c.count} tools
                                    </div>
                                </div>

                                <div className="p-5">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>

                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                        Explore {c.title} <span className="transition group-hover:translate-x-0.5">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* mobile buttons */}
                    <div className="mt-5 flex sm:hidden items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollByCards("left")}
                            className="h-10 px-4 rounded-full border border-border bg-card hover:bg-accent transition"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByCards("right")}
                            className="h-10 px-4 rounded-full border border-border bg-card hover:bg-accent transition"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Tool } from "@/types";
import ToolCard from "@/components/tools/ToolCard";

export default function FeaturedTools({ tools }: { tools: Tool[] }) {
    const items = useMemo(() => {
        const safe = (tools || []).filter(Boolean);
        return safe.length ? [...safe, ...safe] : [];
    }, [tools]);

    if (!tools?.length) return null;

    return (
        <section className="py-16 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-display">Featured AI Tools</h2>
                        <p className="text-muted-foreground mt-2">
                            Hand-picked tools worth trying right now.
                        </p>
                    </div>

                    <Link
                        href="/tools?featured=1"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View all →
                    </Link>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent z-10" />

                    <div className="overflow-hidden rounded-2xl border border-border bg-card/20">
                        <div className="ath-marquee group flex gap-4 p-4">
                            <div className="ath-marquee__track flex gap-4">
                                {items.map((tool, idx) => (
                                    <div key={`${tool.id}-${idx}`} className="w-[320px] sm:w-[360px] shrink-0">
                                        <ToolCard tool={tool} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                        Tip: hover to pause, scroll to explore.
                    </p>
                </div>
            </div>

            <style jsx global>{`
        .ath-marquee__track {
          width: max-content;
          will-change: transform;
          animation: ath-marquee 45s linear infinite;
        }
        .ath-marquee:hover .ath-marquee__track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ath-marquee__track {
            animation: none;
          }
        }
        @keyframes ath-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </section>
    );
}

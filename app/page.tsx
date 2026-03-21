import Link from "next/link";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedToolsCarousel from "@/components/home/FeaturedToolsCarousel";
import LatestToolsCarousel from "@/components/home/LatestToolsCarousel";
import CategoryCarouselServer from "@/components/home/CategoryCarouselServer";
import HomeJladanStrip from "@/components/jladan/HomeJladanStrip";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import CTA from "@/components/home/CTA";
import { getFeaturedTools } from "@/lib/getFeaturedTools";
import { getAllTools, getRecentlyUpdatedTools } from "@/lib/toolsRepo";
import { toPlain } from "@/lib/toPlain.server";
import type { Tool } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const allTools = await getAllTools();

    let featuredTools: Tool[] = [];
    try {
        featuredTools = await getFeaturedTools(6);
    } catch {
        featuredTools = [];
    }

    const latestTools = await getRecentlyUpdatedTools(6);

    const featuredToolsPlain = featuredTools.map((t) => toPlain(t));
    const latestToolsPlain = latestTools.map((t) => toPlain(t));

    return (
        <div className="flex flex-col">
            {/* HERO */}
            <Hero />

            {/* STATS */}
            <Stats toolCount={allTools.length} />

            {/* CATEGORIES */}
            <CategoryCarouselServer />

            {/* TOOLS */}
            <FeaturedToolsCarousel tools={featuredToolsPlain as any} />
            <LatestToolsCarousel tools={latestToolsPlain as any} />

            {/* JLADAN STRIP */}
            <HomeJladanStrip />

            {/* SYSTEMS PROMO */}
            <section className="py-16 border-y border-border bg-muted/30">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            JLADAN Systems
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold mt-5">
                            Proven AI monetization systems
                        </h2>

                        <p className="mt-4 text-muted-foreground">
                            JLADAN Systems are practical playbooks that show you how to build
                            digital products, content systems, and AI workflows that generate real results.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/systems"
                                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95"
                            >
                                Explore systems
                            </Link>

                            <Link
                                href="/pricing"
                                className="rounded-xl border border-border px-6 py-3 font-semibold hover:bg-muted/40"
                            >
                                Unlock JLADAN Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* LIBRARY PROMO */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold">
                            Premium AI resource library
                        </h2>

                        <p className="mt-4 text-muted-foreground">
                            Inside JLADAN Pro you get access to premium templates, prompt packs,
                            monetization kits, and downloadable assets designed to accelerate
                            creators and founders.
                        </p>

                        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                            <li>✓ AI prompts and templates</li>
                            <li>✓ Monetization playbooks</li>
                            <li>✓ Digital product kits</li>
                            <li>✓ Creator growth systems</li>
                        </ul>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href="/library"
                                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95"
                            >
                                Open Library
                            </Link>

                            <Link
                                href="/pricing"
                                className="rounded-xl border border-border px-6 py-3 font-semibold hover:bg-muted/40"
                            >
                                Get JLADAN Pro
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-8">
                        <h3 className="text-xl font-bold mb-4">What you unlock with Pro</h3>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="rounded-xl border border-border p-3">
                                Systems + step-by-step playbooks
                            </div>

                            <div className="rounded-xl border border-border p-3">
                                Premium downloadable assets
                            </div>

                            <div className="rounded-xl border border-border p-3">
                                Full JLADAN resource library
                            </div>

                            <div className="rounded-xl border border-border p-3">
                                Continuous new drops
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEWSLETTER */}
            <NewsletterForm />

            {/* FINAL CTA */}
            <CTA />
        </div>
    );
}
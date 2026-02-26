import Link from "next/link";
import LatestToolsCarousel from "@/components/home/LatestToolsCarousel";
import Hero from "@/components/home/Hero";
import CategoryCarouselServer from "@/components/home/CategoryCarouselServer";
import { toPlain } from "@/lib/toPlain.server";

import FeaturedToolsCarousel from "@/components/home/FeaturedToolsCarousel";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { getFeaturedTools } from "@/lib/getFeaturedTools";
import { getAllTools, getRecentlyUpdatedTools } from "@/lib/toolsRepo";
import { Tool } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    const allTools = await getAllTools();

    let featuredTools: Tool[] = [];
    try {
        featuredTools = await getFeaturedTools(6);
    } catch (e) {
        console.error("getFeaturedTools failed:", e);
        featuredTools = [];
    }

    const latestTools = await getRecentlyUpdatedTools(6);

    const featuredToolsPlain = featuredTools.map((t) => toPlain(t));
    const latestToolsPlain = latestTools.map((t) => toPlain(t));

    return (
        <div className="flex flex-col">
            <Hero />

            <Stats toolCount={allTools.length} />

            <CategoryCarouselServer />

            <FeaturedToolsCarousel tools={featuredToolsPlain as any} />
            <LatestToolsCarousel tools={latestToolsPlain as any} />

            <section className="py-16 bg-muted/30 border-y border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold font-display mb-4">
                            Start with the Best
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Not sure where to look? Check out our curated lists.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/best">View All Lists →</Link>
                    </div>
                </div>
            </section>

            <NewsletterForm />
            <CTA />
        </div>
    );
}
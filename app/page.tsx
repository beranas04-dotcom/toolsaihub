import Link from "next/link";
import ToolCard from "@/components/tools/ToolCard";

import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedTools from "@/components/home/FeaturedTools";
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

    return (
        <div className="flex flex-col">
            <Hero />

            <Stats toolCount={allTools.length} />

            <CategoryGrid />


            <FeaturedTools tools={featuredTools} />

            {/* Latest Tools */}
            <section className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold font-display mb-2">
                                Latest AI Tools
                            </h2>
                            <p className="text-muted-foreground">
                                Discover the newest additions to our directory
                            </p>
                        </div>
                        <Link
                            href="/tools"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>

                    {allTools.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No tools available yet. Check back soon!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Curated Lists */}
            <section className="py-16 bg-muted/30 border-y border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold font-display mb-4">
                            Start with the Best
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Not sure where to look? Check out our curated lists for specific use cases.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/best/ai-tools-for-teachers" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            For Teachers
                        </Link>
                        <Link href="/best/ai-tools-for-youtube-creators" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            For YouTubers
                        </Link>
                        <Link href="/best/ai-tools-for-social-media-management" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            Social Media
                        </Link>
                        <Link href="/best/ai-tools-for-graphic-design" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            Graphic Design
                        </Link>
                        <Link href="/best/ai-tools-for-copywriting" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            Copywriting
                        </Link>
                        <Link href="/best/ai-tools-for-real-estate" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            Real Estate
                        </Link>
                        <Link href="/best/ai-tools-for-hr-and-recruiting" className="bg-background p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition text-center font-medium">
                            HR & Recruiting
                        </Link>
                        <Link href="/best" className="bg-primary/5 p-4 rounded-lg border border-primary/20 hover:bg-primary/10 transition text-center font-medium text-primary">
                            View All Lists →
                        </Link>
                    </div>
                </div>
            </section>

            <NewsletterForm />

            <CTA />
        </div>
    );
}

import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedTools from "@/components/home/FeaturedTools";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import ToolCard from "@/components/tools/ToolCard";
import Link from "next/link";

import { getAllTools, getRecentlyUpdatedTools, getAllCategories } from "@/lib/toolsRepo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
    // 🔥 Fetch from Firestore
    const allTools = (await getAllTools()).filter(
        (t) => t.status === "published"
    );

    const featuredTools = allTools.filter((t) => t.featured).slice(0, 6);

    const latestTools = await getRecentlyUpdatedTools(6);
    const categories = await getAllCategories();

    return (
        <div className="flex flex-col">
            <Hero />

            <Stats toolCount={allTools.length} />

            <CategoryGrid categories={categories} />

            <FeaturedTools tools={featuredTools} />

            <section className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">
                                Latest AI Tools
                            </h2>
                            <p className="text-muted-foreground">
                                Recently updated and verified tools
                            </p>
                        </div>
                        <Link
                            href="/tools"
                            className="text-primary font-medium hover:underline"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                </div>
            </section>

            <NewsletterForm />
            <CTA />
        </div>
    );
}

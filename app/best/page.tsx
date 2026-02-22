import type { Metadata } from "next";
import Link from "next/link";
import { siteMetadata } from "@/lib/siteMetadata";
import { getAllTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: `Best AI Tools by Category | ${siteMetadata.siteName}`,
    description:
        "Explore the best AI tools by category. Carefully curated picks with pricing, features, and direct links.",
    alternates: { canonical: `${siteMetadata.siteUrl.replace(/\/$/, "")}/best` },
};

export default function BestIndexPage() {
    const topics = getAllTopics();

    return (
        <main className="container mx-auto px-6 py-10">
            <section className="mb-10 rounded-3xl border border-border bg-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
                <div className="relative">
                    <h1 className="text-3xl md:text-4xl font-bold">Best AI Tools (Money Pages)</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Pick a category to see the best tools with quick comparisons, pricing notes, and direct links.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            ✅ <span className="font-semibold">{topics.length}</span> categories
                        </div>
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            💰 Optimized for affiliate clicks
                        </div>
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            🔍 Built for SEO + internal linking
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((t) => (
                    <Link
                        key={t.slug}
                        href={`/best/${t.slug}`}
                        className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-md transition"
                    >
                        <div className="text-xs text-muted-foreground mb-2">Category</div>
                        <h2 className="text-xl font-bold group-hover:text-primary transition">
                            {t.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                            {t.description}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            View picks <span className="transition group-hover:translate-x-0.5">→</span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
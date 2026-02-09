import Link from 'next/link';
import { getPaginatedTopics } from '@/lib/topics';
import { Metadata } from "next";
import { siteMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
    title: "Best AI Tools Lists - AIToolsHub",
    description:
        "Explore our curated collections of the best AI tools for every profession and use case.",
    alternates: {
        canonical: `${siteMetadata.siteUrl.replace(/\/$/, "")}/best`,
    },
};


export default function BestPage() {
    const { topics, totalPages } = getPaginatedTopics(1, 20);

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">Curated Best AI Tools</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                Discover the top-rated artificial intelligence software hand-picked for your specific needs, industry, or role.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {topics.map((topic) => (
                    <Link
                        key={topic.slug}
                        href={`/best/${topic.slug}`}
                        className="group block p-6 border border-border rounded-xl hover:shadow-lg hover:border-primary/50 transition duration-300 bg-card"
                    >
                        <h2 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                            {topic.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {topic.description}
                        </p>
                        <div className="mt-4 text-primary text-sm font-medium flex items-center">
                            View Collection
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <span className="px-4 py-2 text-muted-foreground">
                        Page 1 of {totalPages}
                    </span>
                    <Link
                        href="/best/page/2"
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                        Next
                    </Link>
                </div>
            )}
        </main>
    );
}

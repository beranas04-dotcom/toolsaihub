import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPaginatedTopics } from '@/lib/topics';
import { Metadata } from 'next';

interface Props {
    params: {
        page: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const page = parseInt(params.page);
    if (isNaN(page)) return { title: 'Page Not Found' };

    return {
        title: `Best AI Tools Lists - Page ${page} - AIToolsHub`,
        description: `Explore our curated collections of best AI tools. Page ${page}.`,
    };
}

export async function generateStaticParams() {
    const { totalPages } = getPaginatedTopics(1, 20);
    const paths = [];

    for (let i = 1; i <= totalPages; i++) {
        paths.push({ page: i.toString() });
    }

    return paths;
}

export default function BestTopicsPaged({ params }: Props) {
    const page = parseInt(params.page);
    if (isNaN(page)) notFound();

    const { topics, totalPages } = getPaginatedTopics(page, 20);

    if (topics.length === 0) notFound();

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">Curated Best AI Tools</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                Page {page} of our curated AI tool collections.
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
            <div className="flex justify-center gap-2">
                {page > 1 && (
                    <Link
                        href={page === 2 ? '/best' : `/best/page/${page - 1}`}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                        Previous
                    </Link>
                )}

                <span className="px-4 py-2 text-muted-foreground">
                    Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                    <Link
                        href={`/best/page/${page + 1}`}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                        Next
                    </Link>
                )}
            </div>
        </main>
    );
}

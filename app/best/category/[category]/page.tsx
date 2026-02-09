import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import toolsData from '@/data/tools.json';
import { Tool } from '@/types';
import ToolCard from '@/components/tools/ToolCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

interface Props {
    params: {
        category: string;
    };
}

// Helper to normalize category strings for comparison
const normalize = (str: string) => str.toLowerCase().replace(/-/g, ' ');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const category = decodeURIComponent(params.category).replace(/-/g, ' ');
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    // Check if we have any tools for this category
    const hasTools = (toolsData as Tool[]).some(t => t.category && normalize(t.category) === normalize(category));

    if (!hasTools) {
        return {
            title: 'Category Not Found'
        };
    }

    return {
        title: `Best AI ${title} Tools — AIToolsHub`,
        description: `Discover the top-rated AI tools for ${title}. Curated list of best software for ${title} to boost your productivity.`,
        openGraph: {
            title: `Best AI ${title} Tools — AIToolsHub`,
            description: `Discover the top-rated AI tools for ${title}. Curated list of best software for ${title} to boost your productivity.`,
        }
    };
}

export function generateStaticParams() {
    // Get unique categories
    const categories = Array.from(new Set((toolsData as Tool[]).map(t => t.category).filter(Boolean)));
    return categories.map((category) => ({
        category: category!.toLowerCase().replace(/ /g, '-'),
    }));
}

export default function BestCategoryPage({ params }: Props) {
    const categorySlug = decodeURIComponent(params.category);
    const categoryNameNormalized = categorySlug.replace(/-/g, ' ');
    const categoryTitle = categoryNameNormalized.charAt(0).toUpperCase() + categoryNameNormalized.slice(1);

    // Filter tools
    const tools = (toolsData as Tool[]).filter((tool) =>
        tool.category && normalize(tool.category) === normalize(categoryNameNormalized)
    );

    if (tools.length === 0) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="mb-12 text-center max-w-3xl mx-auto">
                <div className="flex justify-center flex-wrap gap-4 mb-6 text-sm font-medium">
                    <Link href="/best" className="text-muted-foreground hover:text-primary">
                        ← All Collections
                    </Link>
                    <span className="text-muted-foreground/30">|</span>
                    <Link href="/categories" className="text-muted-foreground hover:text-primary">
                        Browse all Categories
                    </Link>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
                    Best AI <span className="text-primary">{categoryTitle}</span> Tools
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Browse our curated selection of the best AI tools for {categoryTitle}.
                    We've hand-picked these solutions to help you automate tasks, enhance creativity, and improve workflows in the {categoryTitle.toLowerCase()} space.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>

            <div className="mt-20">
                <NewsletterForm />
            </div>

            <div className="mt-16 bg-muted/30 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
                <p className="text-muted-foreground mb-8">
                    Browse our full directory or check out other popular categories.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/tools" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition">
                        View All Tools
                    </Link>
                    <Link href="/categories" className="bg-background border border-input px-6 py-3 rounded-lg font-medium hover:bg-muted transition">
                        All Categories
                    </Link>
                </div>
            </div>
        </main>
    );
}

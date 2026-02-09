import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTopics } from "@/lib/topics";
import toolsData from "@/data/tools.json";
import type { Tool } from "@/types";
import ToolCard from "@/components/tools/ToolCard";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { siteMetadata } from "@/lib/siteMetadata";

interface Props {
    params: {
        topic: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const topic = getAllTopics().find((t) => t.slug === params.topic);

    if (!topic) {
        return { title: "Topic Not Found" };
    }

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const url = `${base}/best/${topic.slug}`;
    const ogImage = `${base}/api/og?title=${encodeURIComponent(topic.title)}`;

    return {
        title: `${topic.title} — AIToolsHub`,
        description: topic.description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${topic.title} — AIToolsHub`,
            description: topic.description,
            url,
            type: "website",
            images: [ogImage],
        },
        twitter: {
            card: "summary_large_image",
            title: topic.title,
            description: topic.description,
            images: [ogImage],
        },
    };
}

export async function generateStaticParams() {
    return getAllTopics().map((topic) => ({
        topic: topic.slug,
    }));
}

export default function BestTopicPage({ params }: Props) {
    const topic = getAllTopics().find((t) => t.slug === params.topic);

    if (!topic) {
        notFound();
    }

    const base = siteMetadata.siteUrl.replace(/\/$/, "");

    // ✅ Curated first (unique + ordered)
    const curated: Tool[] = (topic as any).curatedToolIds?.length
        ? ((topic as any).curatedToolIds as string[])
            .map((id) => (toolsData as Tool[]).find((t) => t.id === id))
            .filter(Boolean) as Tool[]
        : [];

    // ✅ Fallback match (only if topic.match exists)
    const matchedByRules: Tool[] = (toolsData as Tool[]).filter((tool) => {
        const match = (topic as any).match as
            | { categories?: string[]; tags?: string[] }
            | undefined;
        if (!match) return false;

        // Categories
        if (match.categories && tool.category) {
            if (
                match.categories.some(
                    (c) => c.toLowerCase() === tool.category!.toLowerCase()
                )
            ) {
                return true;
            }
        }

        // Tags
        if (match.tags && tool.tags) {
            if (
                match.tags.some((tag) =>
                    tool.tags!.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
                )
            ) {
                return true;
            }
        }

        return false;
    });

    // ✅ Merge (curated first, then fill without duplicates)
    const mergedTools: Tool[] = [
        ...curated,
        ...matchedByRules.filter((t) => !curated.some((c) => c.id === t.id)),
    ];

    // ✅ 12 + 3 bonus = 15 total
    const MAIN_LIMIT = 12;
    const BONUS_LIMIT = 3;

    const mainTools = mergedTools.slice(0, MAIN_LIMIT);
    const bonusTools = mergedTools.slice(MAIN_LIMIT, MAIN_LIMIT + BONUS_LIMIT);
    const displayedTools = [...mainTools, ...bonusTools];

    // FAQs
    const faqs = [
        {
            question: `Why should I use AI tools for ${topic.title.replace(
                "Best AI Tools for ",
                ""
            )}?`,
            answer:
                "Using AI tools in this field can drastically reduce manual work, uncover new insights, and enhance creativity. They allow professionals to focus on strategy and high-level decision making rather than repetitive tasks.",
        },
        {
            question: "Are these tools free?",
            answer:
                "Most of the tools listed here offer a free tier or a free trial. However, for advanced features and commercial use, paid subscriptions are common.",
        },
        {
            question: "How were these tools selected?",
            answer: `We selected these tools based on their popularity, user ratings, and specific features that cater to the needs of ${topic.title
                .replace("Best AI Tools for ", "")
                .toLowerCase()}.`,
        },
    ];

    // Schema: ItemList
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: topic.title,
        description: topic.description,
        itemListElement: displayedTools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "SoftwareApplication",
                name: tool.name,
                url: `${base}/tools/${tool.id}`,
                description: tool.tagline,
                image: tool.logo ? `${base}${tool.logo}` : undefined,
                offers: {
                    "@type": "Offer",
                    // NOTE: pricing عندك نص بحال "Freemium, Pro $12/mo" ماشي "free"
                    priceCurrency: "USD",
                },
            },
        })),
    };

    return (
        <main className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />

            <div className="mb-12">
                <div className="flex flex-wrap gap-4 mb-6 text-sm font-medium">
                    <Link href="/best" className="text-muted-foreground hover:text-primary">
                        ← Back to Collections
                    </Link>
                    <span className="text-muted-foreground/30">|</span>
                    <Link href="/categories" className="text-muted-foreground hover:text-primary">
                        Browse by Category
                    </Link>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">{topic.title}</h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    {topic.description} In this curated list, we explore the top-rated software
                    solutions designed to help you succeed in{" "}
                    {topic.title.replace("Best AI Tools for ", "")}.
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted px-3 py-1 rounded-full font-medium">
                        {displayedTools.length} picks ({MAIN_LIMIT} main + {BONUS_LIMIT} bonus)
                    </span>
                </div>
            </div>

            {/* Comparison Table (Top 5 from MAIN tools) */}
            {mainTools.length > 0 && (
                <div className="mb-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-6 py-4">Tool</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Pricing</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {mainTools.slice(0, 5).map((tool) => (
                                    <tr key={tool.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                {tool.logo && (
                                                    <img
                                                        src={tool.logo}
                                                        alt={tool.name}
                                                        className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-border"
                                                    />
                                                )}
                                                {tool.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{tool.category}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                {tool.pricing || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/api/out?toolId=${tool.id}`}
                                                target="_blank"
                                                rel="sponsored noopener noreferrer"
                                                className="text-primary hover:text-primary/80 font-semibold hover:underline"
                                            >
                                                Visit →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Grid (12) */}
            {mainTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                    {mainTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-xl mb-16">
                    <h3 className="text-2xl font-semibold mb-2">No tools found</h3>
                    <p className="text-muted-foreground">
                        We are constantly updating our directory. Check back soon for tools in
                        this category.
                    </p>
                </div>
            )}

            {/* ✅ Bonus picks (3) under main grid */}
            {bonusTools.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-6">Bonus picks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {bonusTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                </div>
            )}

            {/* Newsletter */}
            <div className="mb-16">
                <NewsletterForm />
            </div>

            {/* FAQ */}
            <section className="bg-muted/30 rounded-2xl p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                <div className="space-y-8 max-w-3xl">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

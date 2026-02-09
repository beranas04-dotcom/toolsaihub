import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import toolsData from "@/data/tools.json";
import { Tool } from "@/types";
import { siteMetadata } from "@/lib/siteMetadata";
import ToolLogo from "@/components/tools/ToolLogo";
import ToolCard from "@/components/tools/ToolCard";

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const tool = (toolsData as Tool[]).find((t) => t.id === params.id);
    if (!tool) return { title: "Tool Not Found" };

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const toolUrl = `${base}/tools/${tool.id}`;

    const description =
        tool.description && tool.description.length > 40
            ? tool.description.length > 160
                ? tool.description.substring(0, 157) + "..."
                : tool.description
            : `${tool.name} — ${tool.tagline || "AI tool"}${tool.pricing ? ` · Pricing: ${tool.pricing}` : ""}`;

    const ogTitle = `${tool.name} Review, Features & Pricing | ${siteMetadata.siteName}`;
    const ogImage = tool.logo ? `${base}${tool.logo}` : `${base}/og-image.png`;

    return {
        title: ogTitle,
        description,
        alternates: { canonical: toolUrl },
        openGraph: {
            title: ogTitle,
            description,
            url: toolUrl,
            type: "website",
            images: [{ url: ogImage, width: 1200, height: 630, alt: tool.name }],
            siteName: siteMetadata.siteName,
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description,
            images: [ogImage],
            creator: siteMetadata.social.twitter,
        },
    };
}

export function generateStaticParams() {
    return (toolsData as Tool[]).map((tool) => ({ id: tool.id }));
}

export default function ToolPage({ params }: Props) {
    const tool = (toolsData as Tool[]).find((t) => t.id === params.id);
    if (!tool) notFound();

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const toolUrl = `${base}/tools/${tool.id}`;

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
            { "@type": "ListItem", position: 2, name: "Tools", item: `${base}/tools` },
            { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
        ],
    };

    const appJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.tagline || tool.description,
        url: toolUrl,
        image: tool.logo ? `${base}${tool.logo}` : undefined,
        applicationCategory: tool.category || "AI Tool",
        operatingSystem: "Web",
    };

    const currentCategory = (tool.category || "").toLowerCase();
    const currentTags = (tool.tags || []).map((t) => t.toLowerCase());

    const relatedTools = (toolsData as Tool[])
        .filter((t) => t.id !== tool.id)
        .map((t) => {
            const cat = (t.category || "").toLowerCase();
            const tags = (t.tags || []).map((x) => x.toLowerCase());

            const score =
                (cat && currentCategory && cat === currentCategory ? 3 : 0) +
                tags.filter((x) => currentTags.includes(x)).length;

            return { tool: t, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((x) => x.tool);

    const features = (tool.features || []).filter(Boolean);
    const pros = (tool.pros || []).filter(Boolean);
    const cons = (tool.cons || []).filter(Boolean);

    return (
        <main className="container mx-auto px-4 py-12 max-w-5xl">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

            <div className="flex items-center justify-between mb-8">
                <Link href="/tools" className="text-sm text-muted-foreground hover:text-primary">
                    ← Back to Tools
                </Link>
                <Link href="/best" className="text-sm font-medium text-primary hover:underline">
                    Explore best picks →
                </Link>
            </div>

            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <ToolLogo
                        src={tool.logo}
                        alt={tool.name}
                        className="w-24 h-24 rounded-xl object-contain bg-muted/20 p-2"
                    />

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
                        {tool.tagline && <p className="text-lg text-muted-foreground mb-4">{tool.tagline}</p>}

                        <div className="flex flex-wrap gap-2 mb-6">
                            {tool.category && (
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {tool.category}
                                </span>
                            )}
                            {tool.pricing && (
                                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                                    {tool.pricing}
                                </span>
                            )}
                            {tool.freeTrial && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                                    Free trial
                                </span>
                            )}
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div>
                                <div className="font-semibold text-lg">🚀 Try {tool.name}</div>
                                <div className="text-sm text-muted-foreground">Official website / affiliate link.</div>
                            </div>

                            <Link
                                href={`/api/out?toolId=${tool.id}`}
                                target="_blank"
                                rel="sponsored noopener noreferrer"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                            >
                                Visit →
                            </Link>
                        </div>

                        <p className="text-xs text-muted-foreground mb-8">
                            Disclosure: Some links may be affiliate links. We may earn a commission at no extra cost to you.
                        </p>

                        <div className="prose prose-sm dark:prose-invert max-w-none mb-10">
                            <p>{tool.description || "No detailed description available."}</p>
                        </div>

                        {features.length ? (
                            <div className="mb-10">
                                <h2 className="text-xl font-bold mb-4">✨ Key Features</h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {features.map((feature, i) => (
                                        <div key={i} className="bg-muted/40 border border-border rounded-lg px-4 py-2 text-sm">
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {(pros.length || cons.length) ? (
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {pros.length ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">👍 Pros</h3>
                                        <ul className="space-y-2 text-sm">
                                            {pros.map((pro, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-green-600">✓</span>
                                                    <span>{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {cons.length ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">👎 Cons</h3>
                                        <ul className="space-y-2 text-sm">
                                            {cons.map((con, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-red-600">✕</span>
                                                    <span>{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {relatedTools.length ? (
                <section className="mt-14">
                    <h2 className="text-2xl font-bold mb-6">Related Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedTools.map((t) => (
                            <ToolCard key={t.id} tool={t} />
                        ))}
                    </div>
                </section>
            ) : null}
        </main>
    );
}

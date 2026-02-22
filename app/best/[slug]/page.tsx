import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteMetadata } from "@/lib/siteMetadata";
import { getAllTopics } from "@/lib/topics";
import { getAllTools } from "@/lib/toolsRepo";
import ToolCardPro from "@/components/tools/ToolCardPro";


export const dynamic = "force-dynamic";

function baseUrl() {
    return siteMetadata.siteUrl.replace(/\/$/, "");
}

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const topic = getAllTopics().find((t) => t.slug === params.slug);
    if (!topic) return { title: "Not Found" };

    const base = baseUrl();
    const url = `${base}/best/${topic.slug}`;
    const title = `${topic.title} | ${siteMetadata.siteName}`;
    const ogImage = `${base}/api/og?title=${encodeURIComponent(topic.title)}`;

    return {
        title,
        description: topic.description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description: topic.description,
            url,
            images: [{ url: ogImage }],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: topic.description,
            images: [ogImage],
        },
    };
}

export default async function BestTopicPage({
    params,
}: {
    params: { slug: string };
}) {
    const topic = getAllTopics().find((t) => t.slug === params.slug);
    if (!topic) return notFound();

    const base = baseUrl();
    const url = `${base}/best/${topic.slug}`;

    const all = await getAllTools();

    // ✅ tools filtering + scoring
    const keyword = String((topic as any).keyword || topic.title || "")
        .toLowerCase()
        .trim();
    const topicCategory = String((topic as any).category || "")
        .toLowerCase()
        .trim();

    const tools = all
        .filter((t: any) => String(t.status || "").toLowerCase() === "published")
        .map((t: any) => {
            const hay = `${t.name} ${t.tagline} ${t.category} ${(t.tags || []).join(
                " "
            )}`.toLowerCase();

            const catMatch =
                topicCategory &&
                String(t.category || "").toLowerCase().trim() === topicCategory;

            const score =
                (t.featured ? 2 : 0) +
                (t.verified ? 1 : 0) +
                (keyword && hay.includes(keyword) ? 3 : 0) +
                (catMatch ? 2 : 0);

            return { t, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map((x) => x.t);

    // ✅ Breadcrumb JSON-LD
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
            { "@type": "ListItem", position: 2, name: "Best", item: `${base}/best` },
            { "@type": "ListItem", position: 3, name: topic.title, item: url },
        ],
    };

    // ✅ CollectionPage + ItemList JSON-LD
    const itemList = tools.slice(0, 10).map((t: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${base}/tools/${t.slug}`,
    }));
    function pickTopTools(tools: any[], n = 5) {
        return tools.slice(0, n).map((t) => String(t?.name || "").trim()).filter(Boolean);
    }

    function buildAutoFaq(topicTitle: string, topicDescription: string, tools: any[]) {
        const names = pickTopTools(tools, 5);
        const title = String(topicTitle || "this category");
        const desc = String(topicDescription || "").trim();

        const q1 = {
            question: `What are the best ${title} tools in 2026?`,
            answer:
                names.length
                    ? `Top picks right now include: ${names.join(", ")}. We rank tools based on usefulness, features, and overall value.`
                    : `We rank tools based on usefulness, features, and overall value. Add more tools to this category to improve recommendations.`,
        };

        const q2 = {
            question: `How do I choose the right ${title} tool?`,
            answer:
                `Start with your goal (speed, quality, automation). Then compare pricing, key features, and ease-of-use. If available, prefer tools with clear documentation, active updates, and a free trial.`,
        };

        const q3 = {
            question: `Are there free ${title} tools available?`,
            answer:
                `Yes. Many tools offer free plans or free trials. Use filters on our Tools page to find “free” or “freemium” options, then test 2–3 tools before committing.`,
        };

        const q4 = {
            question: `What’s the difference between free, freemium, and paid plans?`,
            answer:
                `Free is fully usable with no cost, freemium is free with limits (features/usage), and paid plans unlock premium features, higher limits, and priority support.`,
        };

        const q5 = {
            question: `Do these tools have affiliate links?`,
            answer:
                `Some links may be affiliate links. If you purchase through them, we may earn a commission at no extra cost to you. This helps keep the directory updated.`,
        };

        const faqs = [q1, q2, q3, q4, q5];

        // ✅ FAQPage JSON-LD
        const faqJsonLd = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: f.answer,
                },
            })),
        };

        return { faqs, faqJsonLd, desc };
    }
    const collectionJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: topic.title,
        description:
            topic.description ||
            `Best ${String((topic as any).keyword || topic.title)} tools in 2026.`,
        url,
        mainEntity: {
            "@type": "ItemList",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: itemList.length,
            itemListElement: itemList,
        },
    };
    const { faqs, faqJsonLd } = buildAutoFaq(topic.title, topic.description || "", tools);
    return (
        <main className="container mx-auto px-6 py-10">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            {/* Hero */}
            <section className="mb-10 rounded-3xl border border-border bg-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
                <div className="relative">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <Link
                                href="/best"
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                ← Back to Best
                            </Link>
                            <h1 className="mt-3 text-3xl md:text-4xl font-bold">
                                {topic.title}
                            </h1>
                            <p className="mt-2 text-muted-foreground max-w-2xl">
                                {topic.description}
                            </p>
                        </div>

                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                        >
                            Browse all tools →
                        </Link>
                    </div>

                    <div className="mt-6 text-xs text-muted-foreground">
                        Disclosure: Some links may be affiliate links. We may earn a
                        commission at no extra cost to you.
                    </div>
                </div>
            </section>

            {/* Quick picks */}
            <section className="mb-8 rounded-2xl border border-border bg-muted/30 p-6">
                <div className="text-lg font-bold mb-2">Quick picks</div>
                <p className="text-sm text-muted-foreground">
                    These are the strongest options we recommend right now based on
                    features, ease-of-use, and value.
                </p>

                {tools.length ? (
                    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((t: any) => (
                            <ToolCardPro key={t.id} tool={t} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 text-sm text-muted-foreground">
                        No matching tools yet. Add more tools in this category to strengthen
                        this page.
                    </div>
                )}
            </section>
            {/* FAQ */}
            <section className="mt-10 rounded-2xl border border-border bg-card p-6">
                <h2 className="text-2xl font-bold mb-2">FAQ</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Quick answers to help you choose faster.
                </p>

                <div className="space-y-3">
                    {faqs.map((f, idx) => (
                        <details key={idx} className="group rounded-xl border border-border bg-muted/20 p-4">
                            <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                                <span>{f.question}</span>
                                <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
                            </summary>
                            <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                {f.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </section>
            {/* Internal links */}
            <section className="mt-10 rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold">Learn how to choose faster</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Want guides and workflows for this category? Read our blog posts and
                    comparisons.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href="/blog"
                        className="px-4 py-2 rounded-xl border border-border hover:border-primary/60 transition"
                    >
                        Read Blog →
                    </Link>
                    <Link
                        href="/categories"
                        className="px-4 py-2 rounded-xl border border-border hover:border-primary/60 transition"
                    >
                        Browse Categories →
                    </Link>
                </div>
            </section>
        </main>
    );
}
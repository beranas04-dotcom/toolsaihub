import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/reviews/ReviewForm";

import type { Tool, Review } from "@/types";
import { siteMetadata } from "@/lib/siteMetadata";
import { getToolById, getRelatedTools } from "@/lib/toolsRepo";
import { getApprovedReviewsForTool, getReviewsSummaryForTool } from "@/lib/reviewsRepo";

function getDomain(url?: string) {
    if (!url) return "";
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return url.replace(/^https?:\/\//, "").split("/")[0];
    }
}

function toNiceDate(d?: string) {
    if (!d) return "";
    const t = Date.parse(d);
    if (!Number.isFinite(t)) return "";
    return new Date(t).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function Stars({ value, idPrefix }: { value: number; idPrefix: string }) {
    const v = clamp(value || 0, 0, 5);
    const full = Math.floor(v);
    const half = v - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    const gradId = `${idPrefix}-half`;

    const Star = ({ filled }: { filled: "full" | "half" | "empty" }) => (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <defs>
                <linearGradient id={gradId}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                </linearGradient>
            </defs>
            <path
                d="M12 17.27l-5.18 3.05 1.64-5.81L3 9.24l6-.52L12 3l3 5.72 6 .52-5.46 5.27 1.64 5.81z"
                fill={
                    filled === "full"
                        ? "currentColor"
                        : filled === "half"
                            ? `url(#${gradId})`
                            : "transparent"
                }
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );

    return (
        <span className="inline-flex items-center gap-1 text-primary">
            {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} filled="full" />)}
            {half ? <Star filled="half" /> : null}
            {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} filled="empty" />)}
        </span>
    );
}


export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const tool = await getToolById(params.slug);
    if (!tool) return { title: "Tool Not Found" };

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const url = `${base}/tools/${tool.slug || tool.id}`;
    const title = `${tool.name} — ${siteMetadata.siteName}`;
    const description =
        tool.tagline || tool.description || `Explore ${tool.name} on AIToolsHub.`;
    const ogImage = `${base}/api/og?title=${encodeURIComponent(tool.name)}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { type: "website", url, title, description, images: [ogImage] },
        twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    };
}

export default async function ToolDetailsPage({
    params,
}: {
    params: { slug: string };
}) {
    const tool = (await getToolById(params.slug)) as Tool | null;
    if (!tool) return notFound();

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const canonical = `${base}/tools/${tool.slug || tool.id}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.tagline || tool.description || "",
        applicationCategory: tool.category || "AI Tool",
        operatingSystem: "Web",
        url: canonical,
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: base },
            { "@type": "ListItem", position: 2, name: "Tools", item: `${base}/tools` },
            { "@type": "ListItem", position: 3, name: tool.name, item: canonical },
        ],
    };
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: `What is ${tool.name}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text:
                        tool.description ||
                        tool.tagline ||
                        `${tool.name} is an AI tool listed on ${siteMetadata.siteName}.`,
                },
            },
            {
                "@type": "Question",
                name: `Is ${tool.name} free?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: tool.pricing
                        ? `${tool.name} pricing: ${tool.pricing}.`
                        : `${tool.name} pricing details are not available yet.`,
                },
            },
            {
                "@type": "Question",
                name: `Does ${tool.name} offer a free trial?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text:
                        (tool as any).freeTrial === true
                            ? `Yes, ${tool.name} offers a free trial.`
                            : `No free trial is listed for ${tool.name}.`,
                },
            },
            {
                "@type": "Question",
                name: `What are the best use cases for ${tool.name}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: tool.useCases?.length
                        ? tool.useCases.slice(0, 5).join(" • ")
                        : `Common use cases include productivity, content creation, and automation (depending on the tool).`,
                },
            },
            {
                "@type": "Question",
                name: `Where can I access ${tool.name}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: tool.website
                        ? `Official website: ${tool.website}`
                        : `The official website is not available yet.`,
                },
            },
        ],
    };

    const visitHref = `/api/out?toolId=${encodeURIComponent(tool.slug || tool.id)}`;
    const websiteDomain = getDomain(tool.website);

    const lastUpdated =
        (tool as any).lastUpdated || tool.updatedAt || tool.createdAt;
    const lastUpdatedNice = toNiceDate(lastUpdated);

    const logoSrc = (tool.logo && tool.logo.trim()) || "/logo.svg";

    // ✅ Related tools (no index required in our implementation)
    const related =
        tool.category
            ? await getRelatedTools({
                category: tool.category,
                excludeId: tool.id,
                limit: 6,
            })
            : [];

    // ✅ Reviews (no index required)
    const summary = await getReviewsSummaryForTool(tool.id);
    const latestReviews = (await getApprovedReviewsForTool({
        toolId: tool.id,
        limit: 6,
    })) as Review[];

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <div className="mb-8 flex items-center justify-between gap-3">
                <Link
                    href="/tools"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    ← Back to Tools
                </Link>

                {tool.verified ? (
                    <span className="text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
                        ✅ Verified
                    </span>
                ) : null}
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                        <img
                            src={logoSrc}
                            alt={tool.name}
                            className="w-14 h-14 rounded-xl object-contain bg-muted/30 p-2"
                            loading="lazy"
                        />

                        <div className="min-w-0">
                            <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                                {tool.name}
                            </h1>

                            {tool.tagline ? (
                                <p className="mt-2 text-muted-foreground text-base sm:text-lg">
                                    {tool.tagline}
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {tool.category ? (
                                    <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                                        {tool.category}
                                    </span>
                                ) : null}

                                {tool.pricing ? (
                                    <span className="text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
                                        {tool.pricing}
                                    </span>
                                ) : null}

                                {(tool as any).freeTrial ? (
                                    <span className="text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
                                        Free trial
                                    </span>
                                ) : null}

                                {lastUpdatedNice ? (
                                    <span className="text-xs text-muted-foreground">
                                        Updated: <span className="text-foreground">{lastUpdatedNice}</span>
                                    </span>
                                ) : null}
                            </div>

                            {/* Rating summary */}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {summary.reviewCount > 0 ? (
                                    <>
                                        <Stars value={summary.averageRating} idPrefix={`summary-${tool.id}`} />

                                        <span className="text-sm font-semibold text-foreground">
                                            {summary.averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({summary.reviewCount} reviews)
                                        </span>
                                        <Link href="#reviews" className="text-sm text-primary hover:underline">
                                            Read reviews →
                                        </Link>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        No reviews yet.
                                    </span>
                                )}
                            </div>

                            {tool.tags?.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {tool.tags.slice(0, 10).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}

                            {tool.website ? (
                                <div className="mt-3 text-xs text-muted-foreground">
                                    🔗 {websiteDomain}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:w-[260px]">
                        <Link
                            href={visitHref}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition"
                        >
                            Visit website →
                        </Link>

                        {/* If you already have my-reviews page, this is perfect */}
                        <Link
                            href="#write-review"
                            className="text-sm text-primary hover:underline"
                        >
                            Write a review →
                        </Link>

                    </div>
                </div>
            </section>
            <div className="my-6">
                <div className="h-[90px] bg-muted flex items-center justify-center rounded-xl">
                    Ad space
                </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-8">
                    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                        <h2 className="text-xl font-bold mb-3">About</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {tool.description || "No description yet."}
                        </p>
                    </section>
                    <div className="my-6">
                        <div className="h-[90px] bg-muted flex items-center justify-center rounded-xl">
                            Ad space
                        </div>
                    </div>

                    {tool.pricingDetails ? (
                        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-3">Pricing details</h2>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {tool.pricingDetails}
                            </p>
                        </div>
                    ) : null}


                    {tool.features?.length ? (
                        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Key features</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {tool.features.map((f, i) => (
                                    <div key={i} className="px-3 py-2 rounded-lg border border-border">
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {(tool.pros?.length || tool.cons?.length) ? (
                        <div className="mt-8 grid md:grid-cols-2 gap-6">

                            {tool.pros?.length ? (
                                <div className="rounded-2xl border border-green-500/30 p-6">
                                    <h3 className="font-semibold mb-3 text-green-400">Pros</h3>
                                    <ul className="space-y-2 text-sm">
                                        {tool.pros.map((p, i) => (
                                            <li key={i}>✔ {p}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {tool.cons?.length ? (
                                <div className="rounded-2xl border border-red-500/30 p-6">
                                    <h3 className="font-semibold mb-3 text-red-400">Cons</h3>
                                    <ul className="space-y-2 text-sm">
                                        {tool.cons.map((c, i) => (
                                            <li key={i}>⚠ {c}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                        </div>
                    ) : null}
                    {tool.useCases?.length ? (
                        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Use cases</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {tool.useCases.map((u, i) => (
                                    <div key={i} className="px-3 py-2 rounded-lg border border-border">
                                        {u}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}


                    {/* ===== FAQ (outside Pros&Cons) ===== */}
                    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                        <h2 className="text-xl font-bold mb-6">FAQ</h2>

                        <div className="space-y-3">
                            {[
                                {
                                    q: `What is ${tool.name}?`,
                                    a: tool.description || tool.tagline || `${tool.name} is an AI tool listed on ${siteMetadata.siteName}.`,
                                },
                                {
                                    q: `Is ${tool.name} free?`,
                                    a: tool.pricing ? `${tool.name} pricing: ${tool.pricing}.` : `${tool.name} pricing details are not available yet.`,
                                },
                                {
                                    q: `Does ${tool.name} offer a free trial?`,
                                    a: (tool as any).freeTrial === true ? `Yes, ${tool.name} offers a free trial.` : `No free trial is listed for ${tool.name}.`,
                                },
                                {
                                    q: `What are the best use cases for ${tool.name}?`,
                                    a: tool.useCases?.length ? tool.useCases.slice(0, 5).join(" • ") : `Common use cases include productivity, content creation, and automation (depending on the tool).`,
                                },
                                {
                                    q: `Where can I access ${tool.name}?`,
                                    a: tool.website ? `Official website: ${tool.website}` : `The official website is not available yet.`,
                                },
                            ].map((item) => (
                                <details key={item.q} className="group rounded-xl border border-border bg-background px-5 py-4">
                                    <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                                        <span className="text-foreground">{item.q}</span>
                                        <span className="text-muted-foreground group-open:rotate-180 transition">▼</span>
                                    </summary>
                                    <div className="mt-3 text-sm text-muted-foreground leading-relaxed break-words">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* ===== Use cases (outside Pros&Cons) ===== */}
                    {tool.useCases?.length ? (
                        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                            <h2 className="text-xl font-bold mb-6">Use cases</h2>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                {tool.useCases.map((u) => (
                                    <div
                                        key={u}
                                        className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:shadow-sm transition"
                                    >
                                        <span className="mt-0.5 text-primary text-lg shrink-0">✓</span>
                                        <p className="text-sm text-muted-foreground leading-relaxed break-words">{u}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}
                    <div className="my-6">
                        <div className="h-[90px] bg-muted flex items-center justify-center rounded-xl">
                            Ad space
                        </div>
                    </div>

                    {/* Reviews section */}
                    <section id="reviews" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-xl font-bold">Reviews</h2>
                        </div>
                        {latestReviews.length ? (
                            <div className="space-y-4">
                                {latestReviews.map((r: any) => (
                                    <div key={r.id} className="rounded-xl border border-border bg-background p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold">
                                                    {r.title || "Review"}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {r.name ? `by ${r.name}` : "by Anonymous"}
                                                    {r.createdAt ? ` • ${toNiceDate(r.createdAt)}` : ""}
                                                </div>
                                            </div>

                                            {r.rating ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <Stars value={Number(r.rating)} idPrefix={`review-${r.id}`} />

                                                    <span className="text-xs text-muted-foreground">
                                                        {Number(r.rating).toFixed(1)} / 5
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                            {r.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border bg-background p-5">
                                <p className="text-sm text-muted-foreground">
                                    No reviews yet. Be the first to write one.
                                </p>
                            </div>
                        )}
                        <div id="write-review" className="scroll-mt-28">
                            <ReviewForm toolId={tool.id} toolName={tool.name} />
                        </div>

                    </section>
                </div>

                <aside className="space-y-6">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-bold mb-4">Quick facts</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium">{tool.category || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Pricing</span>
                                <span className="font-medium text-right">{tool.pricing || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Free trial</span>
                                <span className="font-medium">
                                    {(tool as any).freeTrial ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Website</span>
                                <span className="font-medium">{websiteDomain || "—"}</span>
                            </div>
                        </div>
                    </section>

                    {related.length ? (
                        <section className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Related tools</h2>
                                {tool.category ? (
                                    <Link
                                        href={`/tools?category=${encodeURIComponent(tool.category)}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View more →
                                    </Link>
                                ) : null}
                            </div>

                            <div className="space-y-3">
                                {related.map((t: Tool) => (
                                    <Link
                                        key={t.id}
                                        href={`/tools/${t.slug || t.id}`}
                                        className="block rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:shadow-sm transition"
                                    >
                                        <div className="font-semibold line-clamp-1">{t.name}</div>
                                        {t.tagline ? (
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {t.tagline}
                                            </div>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </aside>
            </div>
        </main>
    );
}

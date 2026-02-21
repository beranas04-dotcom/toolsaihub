import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { siteMetadata } from "@/lib/siteMetadata";
import BlogIndexClient from "@/components/blog/BlogIndexClient";

export const dynamic = "force-dynamic";

function siteBase() {
    return siteMetadata.siteUrl.replace(/\/$/, "");
}

function normalizeTag(tag: string) {
    return decodeURIComponent(tag || "").trim();
}

export async function generateMetadata({
    params,
}: {
    params: { tag: string };
}): Promise<Metadata> {
    const tag = normalizeTag(params.tag);
    const base = siteBase();
    const url = `${base}/blog/tag/${encodeURIComponent(tag)}`;

    return {
        title: `${tag} Articles | ${siteMetadata.siteName}`,
        description: `Browse ${tag} articles: guides, comparisons, and workflows.`,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
            title: `${tag} Articles | ${siteMetadata.siteName}`,
            description: `Browse ${tag} articles: guides, comparisons, and workflows.`,
            images: [{ url: `${base}/api/og?title=${encodeURIComponent(`${tag} Articles`)}` }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${tag} Articles`,
            description: `Browse ${tag} articles: guides, comparisons, and workflows.`,
            images: [`${base}/api/og?title=${encodeURIComponent(`${tag} Articles`)}`],
        },
    };
}

export default function BlogTagPage({ params }: { params: { tag: string } }) {
    const tag = normalizeTag(params.tag);

    const posts = getAllPosts().filter((p) =>
        (p.tags || []).map(String).includes(tag)
    );

    return (
        <main className="container mx-auto px-6 py-10">
            <div className="mb-10 rounded-3xl border border-border bg-card p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
                <div className="relative">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl font-bold">#{tag}</h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl">
                                Articles tagged with <span className="font-semibold text-foreground">#{tag}</span>.
                            </p>
                        </div>

                        <Link
                            href="/blog"
                            className="text-sm text-muted-foreground hover:text-primary transition"
                        >
                            ← Back to Blog
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            🏷️ <span className="font-semibold">{posts.length}</span> posts
                        </div>
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            🎯 SEO tag page
                        </div>
                    </div>
                </div>
            </div>

            {/* reuse same UI */}
            <BlogIndexClient posts={posts} />
        </main>
    );
}
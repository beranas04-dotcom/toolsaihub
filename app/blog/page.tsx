import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import BlogIndexClient from "@/components/blog/BlogIndexClient";
import { siteMetadata } from "@/lib/siteMetadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: `Blog | ${siteMetadata.siteName}`,
    description:
        "Guides, comparisons, and practical workflows to pick the right AI tools and get results faster.",
    alternates: { canonical: `${siteMetadata.siteUrl.replace(/\/$/, "")}/blog` },
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <main className="container mx-auto px-6 py-10">
            <div className="mb-10 rounded-3xl border border-border bg-card p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
                <div className="relative">
                    <h1 className="text-3xl font-bold">Blog</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Guides, comparisons, and practical workflows to pick the right AI tools and get results faster.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            ✍️ <span className="font-semibold">{posts.length}</span> posts
                        </div>
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            ⚡ Updated regularly
                        </div>
                        <div className="rounded-full border border-border bg-background px-4 py-2">
                            🎯 Built for SEO + conversion
                        </div>
                    </div>
                </div>
            </div>

            <BlogIndexClient posts={posts} />
        </main>
    );
}
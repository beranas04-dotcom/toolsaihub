import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import Link from "next/link";
import { defaultAuthor } from "@/lib/author";
import { siteMetadata } from "@/lib/siteMetadata";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostBySlug(params.slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const url = `${base}/blog/${post.slug}`;
    const ogImage = `${base}/api/og?title=${encodeURIComponent(post.title)}`;

    return {
        title: `${post.title} - AIToolsHub`,
        description: post.description,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            url,
            publishedTime: post.date || undefined,
            authors: [defaultAuthor.name],
            images: [ogImage],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: [ogImage],
        },
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }: Props) {
    const post = getPostBySlug(params.slug);
    if (!post) return notFound();

    const base = siteMetadata.siteUrl.replace(/\/$/, "");

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date || undefined,
        author: {
            "@type": "Person",
            name: defaultAuthor.name,
            url: defaultAuthor.url,
        },
        publisher: {
            "@type": "Organization",
            name: siteMetadata.siteName,
            logo: {
                "@type": "ImageObject",
                url: `${base}/logo.png`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${base}/blog/${post.slug}`,
        },
    };

    const relatedPosts = getAllPosts()
        .filter((p) => p.slug !== post.slug)
        .slice(0, 12)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    return (
        <article className="container mx-auto px-4 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <div className="flex justify-center flex-wrap gap-4 mb-6">
                        <Link
                            href="/blog"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            ← Back to Blog
                        </Link>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground max-w-2xl mx-auto">
                        <div className="flex items-center gap-2">
                            <img
                                src={defaultAuthor.avatar}
                                alt={defaultAuthor.name}
                                className="w-10 h-10 rounded-full bg-slate-200"
                            />
                            <div className="text-left">
                                <div className="font-medium text-foreground">
                                    {defaultAuthor.name}
                                </div>
                                <div className="text-xs">{defaultAuthor.role}</div>
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-border" />

                        <div className="text-left">
                            <div className="text-xs uppercase tracking-wider mb-0.5">
                                Last Updated
                            </div>

                            {post.date ? (
                                <time
                                    dateTime={post.date}
                                    className="font-medium text-foreground"
                                >
                                    {new Date(post.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                            ) : (
                                <div className="font-medium text-foreground">—</div>
                            )}

                            <div className="text-xs mt-1 text-muted-foreground">
                                {post.readingMinutes} min read
                            </div>
                        </div>
                    </div>

                    {post.tags?.length > 0 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {post.tags.slice(0, 6).map((t) => (
                                <span
                                    key={t}
                                    className="text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Featured Image Placeholder */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-2xl mb-12 flex items-center justify-center overflow-hidden border border-border/50">
                    <span className="text-9xl opacity-10">✍️</span>
                    <div className="absolute inset-0 bg-grid-slate-500/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]" />
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none mb-16 mx-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Author Box */}
                <div className="bg-muted/30 rounded-xl p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-16 border border-border/50">
                    <img
                        src={defaultAuthor.avatar}
                        alt={defaultAuthor.name}
                        className="w-24 h-24 rounded-full bg-slate-200 ring-4 ring-background"
                    />
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold mb-2">
                            About {defaultAuthor.name}
                        </h3>
                        <p className="text-sm text-primary font-medium mb-4">
                            {defaultAuthor.role}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {defaultAuthor.bio}
                        </p>
                        <a
                            href={defaultAuthor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                        >
                            Follow on Twitter
                        </a>
                    </div>
                </div>

                {/* Internal Link Block */}
                <div className="bg-primary/5 rounded-2xl p-8 sm:p-12 text-center mb-16 border border-primary/10">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to optimize your workflow?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Discover hundreds of curated AI tools to boost your productivity
                        today.
                    </p>
                    <Link
                        href="/tools"
                        className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Explore AI Tools
                    </Link>
                </div>

                {/* Newsletter */}
                <div className="mb-16">
                    <NewsletterForm />
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="border-t border-border pt-16">
                        <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((p) => (
                                <Link
                                    key={p.slug}
                                    href={`/blog/${p.slug}`}
                                    className="group block"
                                >
                                    <div className="aspect-video bg-muted rounded-xl mb-4 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {p.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {p.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

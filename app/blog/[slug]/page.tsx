import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { defaultAuthor } from "@/lib/author";
import { siteMetadata } from "@/lib/siteMetadata";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { autoLinkMarkdown } from "@/lib/internalLinks";
interface Props {
    params: { slug: string };
}

function slugifyId(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);
}

/**
 * ✅ Internal linking map
 * - keyword: the term to detect
 * - url: internal url to link to
 *
 * Tip: زيد هنا keywords ديال tools ديالك (Copy.ai, DALL·E, Midjourney...)
 */
const INTERNAL_LINKS: { keyword: string; url: string }[] = [
    { keyword: "AI tools", url: "/tools" },
    { keyword: "best AI tools", url: "/tools" },
    { keyword: "AI writing tools", url: "/blog/best-ai-writing-tools-2026" },
    { keyword: "SEO", url: "/blog" },

    // مثال ديال tools (بدّل slugs على حساب موجود عندك)
    { keyword: "Copy", url: "/tools/copy-ai" },
    { keyword: "DALL·E Studio", url: "/tools/dalle3-proxy" },
    { keyword: "Midjourney", url: "/tools/midjourneyx" },
    { keyword: "Jasper", url: "/tools/jasper-ai" },
    { keyword: "Surfer", url: "/tools/surfer-seo" },
    { keyword: "Writesonic", url: "/tools/writesonic" },
    { keyword: "Canva", url: "/tools/canva" },
    { keyword: "ChatGPT", url: "/tools/chatgpt" },
    { keyword: "Claude", url: "/tools/claude" },
    { keyword: "Notion", url: "/tools/notion-ai" },
    { keyword: "DocSynth", url: "/tools/docsynth" },
    { keyword: "ElevenLabs", url: "/tools/elevenlabs" },
    { keyword: "Fireflies", url: "/tools/fireflies" },
    { keyword: "GitAssist", url: "/tools/gitassist" },
    { keyword: "imageOpt", url: "/tools/imageopt" },
    { keyword: "Leonardo", url: "/tools/leonardo-ai" },
    { keyword: "MarketMuse Lite", url: "/tools/marketmuse-lite" },
    { keyword: "Murf", url: "/tools/murf-ai" },
    { keyword: "Phrasee", url: "/tools/phrasee" },
    { keyword: "Pictory", url: "/tools/pictory" },
    { keyword: "PlayHT", url: "/tools/playht" },
    { keyword: "PromptBase Lite", url: "/tools/promptbase-lite" },
    { keyword: "PromptHub", url: "/tools/prompthub" },
    { keyword: "ReplitAI", url: "/tools/replitai" },
    { keyword: "Runway", url: "/tools/runway-ml" },
    { keyword: "Scribely", url: "/tools/scribely" },
    { keyword: "Synth", url: "/tools/synth-ai" },
    { keyword: "Synthesia", url: "/tools/synthesia" },
    { keyword: "VidOpt", url: "/tools/vidopt" },
];

/**
 * ✅ Replace keywords in plain text nodes ONLY (safe)
 * This avoids breaking markdown structure.
 */
function SmartLinks({ children }: { children: any }) {
    // If not a simple string, return as is
    if (typeof children !== "string") return children;

    let parts: Array<string | { text: string; href: string }> = [children];

    for (const item of INTERNAL_LINKS) {
        const next: typeof parts = [];

        for (const p of parts) {
            if (typeof p !== "string") {
                next.push(p);
                continue;
            }

            // split preserving keyword (case-insensitive)
            const re = new RegExp(`(${escapeRegExp(item.keyword)})`, "gi");
            const chunks = p.split(re);

            for (const c of chunks) {
                if (!c) continue;
                if (c.toLowerCase() === item.keyword.toLowerCase()) {
                    next.push({ text: c, href: item.url });
                } else {
                    next.push(c);
                }
            }
        }

        parts = next;
    }

    return (
        <>
            {parts.map((p, idx) => {
                if (typeof p === "string") return <span key={idx}>{p}</span>;
                return (
                    <Link
                        key={idx}
                        href={p.href}
                        className="text-primary underline underline-offset-4 hover:opacity-90"
                    >
                        {p.text}
                    </Link>
                );
            })}
        </>
    );
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostBySlug(params.slug);
    if (!post) return { title: "Post Not Found" };

    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const url = `${base}/blog/${post.slug}`;

    const cover = post.image
        ? post.image.startsWith("http")
            ? post.image
            : `${base}${post.image}`
        : "";
    const ogImage = cover || `${base}/api/og?title=${encodeURIComponent(post.title)}`;

    const title = `${post.title} - ${siteMetadata.siteName}`;

    return {
        title,
        description: post.description,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            url,
            title,
            description: post.description,
            publishedTime: post.date || undefined,
            authors: [defaultAuthor.name],
            images: [{ url: ogImage }],
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
    const canonicalUrl = `${base}/blog/${post.slug}`;

    const coverSrc = post.image ? post.image : `/api/og?title=${encodeURIComponent(post.title)}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date || undefined,
        dateModified: post.date || undefined,
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
            "@id": canonicalUrl,
        },
    };

    const currentTags = (post.tags || []).map((t) => String(t).toLowerCase());
    const relatedPosts = getAllPosts()
        .filter((p) => p.slug !== post.slug)
        .map((p) => {
            const tags = (p.tags || []).map((t) => String(t).toLowerCase());
            const score = tags.filter((t) => currentTags.includes(t)).length;
            return { p, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => x.p);

    const headings: { id: string; text: string; level: number }[] = [];
    const headingRegex = /^(#{2,3})\s+(.*)$/gm;
    let m: RegExpExecArray | null;
    while ((m = headingRegex.exec(post.content)) !== null) {
        const level = m[1].length;
        const text = (m[2] || "").trim();
        const id = slugifyId(text);
        if (text) headings.push({ id, text, level });
    }

    return (
        <article className="container mx-auto px-4 py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-[1fr_320px] gap-10">
                    {/* MAIN */}
                    <div className="min-w-0">
                        <header className="mb-10 text-center">
                            <div className="flex justify-center flex-wrap gap-4 mb-6">
                                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                                    ← Back to Blog
                                </Link>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{post.title}</h1>

                            <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground max-w-2xl mx-auto">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={defaultAuthor.avatar}
                                        alt={defaultAuthor.name}
                                        className="w-10 h-10 rounded-full bg-slate-200"
                                    />
                                    <div className="text-left">
                                        <div className="font-medium text-foreground">{defaultAuthor.name}</div>
                                        <div className="text-xs">{defaultAuthor.role}</div>
                                    </div>
                                </div>

                                <div className="hidden sm:block w-px h-8 bg-border" />

                                <div className="text-left">
                                    <div className="text-xs uppercase tracking-wider mb-0.5">Last Updated</div>

                                    {post.date ? (
                                        <time dateTime={post.date} className="font-medium text-foreground">
                                            {new Date(post.date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </time>
                                    ) : (
                                        <div className="font-medium text-foreground">—</div>
                                    )}

                                    <div className="text-xs mt-1 text-muted-foreground">{post.readingMinutes} min read</div>
                                </div>
                            </div>

                            {(post.tags || []).length > 0 ? (
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {(post.tags || []).slice(0, 8).map((t) => (
                                        <Link
                                            key={t}
                                            href={`/blog/tag/${encodeURIComponent(String(t))}`}
                                            className="text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
                                        >
                                            {String(t)}
                                        </Link>
                                    ))}
                                </div>
                            ) : null}
                        </header>

                        {/* Featured Image */}
                        <div className="relative w-full aspect-[16/9] rounded-2xl mb-12 overflow-hidden border border-border/60 bg-muted">
                            {coverSrc.startsWith("/api/og") ? (
                                <img src={coverSrc} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                                <Image
                                    src={coverSrc}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 900px"
                                    priority={false}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                        </div>

                        {/* ✅ Content with Smart Internal Links */}
                        <div className="prose prose-lg dark:prose-invert max-w-none mb-16 mx-auto">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // ✅ Keep TOC ids
                                    h2: ({ children }) => {
                                        const text = String(children);
                                        const id = slugifyId(text);
                                        return (
                                            <h2 id={id} className="scroll-mt-28">
                                                {children}
                                            </h2>
                                        );
                                    },
                                    h3: ({ children }) => {
                                        const text = String(children);
                                        const id = slugifyId(text);
                                        return (
                                            <h3 id={id} className="scroll-mt-28">
                                                {children}
                                            </h3>
                                        );
                                    },

                                    // ✅ Internal linking on text only
                                    p: ({ children }) => <p><SmartLinks>{children}</SmartLinks></p>,
                                    li: ({ children }) => <li><SmartLinks>{children}</SmartLinks></li>,
                                    strong: ({ children }) => <strong><SmartLinks>{children}</SmartLinks></strong>,
                                    em: ({ children }) => <em><SmartLinks>{children}</SmartLinks></em>,

                                    // ✅ Make markdown links use Next Link when internal
                                    a: ({ href, children }) => {
                                        const h = String(href || "");
                                        const isInternal = h.startsWith("/") || h.startsWith("#");
                                        if (isInternal) {
                                            return (
                                                <Link href={h} className="text-primary underline underline-offset-4 hover:opacity-90">
                                                    {children}
                                                </Link>
                                            );
                                        }
                                        return (
                                            <a
                                                href={h}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary underline underline-offset-4 hover:opacity-90"
                                            >
                                                {children}
                                            </a>
                                        );
                                    },
                                }}
                            >
                                {autoLinkMarkdown(post.content)}
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
                                <h3 className="text-xl font-bold mb-2">About {defaultAuthor.name}</h3>
                                <p className="text-sm text-primary font-medium mb-4">{defaultAuthor.role}</p>
                                <p className="text-muted-foreground leading-relaxed mb-4">{defaultAuthor.bio}</p>
                                <a
                                    href={defaultAuthor.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                                >
                                    Follow
                                </a>
                            </div>
                        </div>

                        {/* Internal Link Block */}
                        <div className="bg-primary/5 rounded-2xl p-8 sm:p-12 text-center mb-16 border border-primary/10">
                            <h2 className="text-3xl font-bold mb-4">Ready to optimize your workflow?</h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Discover hundreds of curated AI tools to boost your productivity today.
                            </p>
                            <Link
                                href="/tools"
                                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Explore AI Tools →
                            </Link>
                        </div>

                        {/* Newsletter */}
                        <div className="mb-16">
                            <NewsletterForm />
                        </div>

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="border-t border-border pt-16">
                                <h3 className="text-2xl font-bold mb-2">Continue Reading</h3>
                                <p className="text-muted-foreground mb-8">
                                    Discover more guides to master AI tools and boost your productivity.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {relatedPosts.map((p) => (
                                        <Link
                                            key={p.slug}
                                            href={`/blog/${p.slug}`}
                                            className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-md transition"
                                        >
                                            <div className="relative aspect-video bg-muted">
                                                {p.image ? (
                                                    <Image
                                                        src={p.image}
                                                        alt={p.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h4 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {p.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <aside className="hidden lg:block lg:sticky lg:top-24 h-fit space-y-6">
                        {headings.length > 0 ? (
                            <div className="rounded-2xl border border-border bg-card p-5">
                                <div className="font-bold text-sm mb-3">On this page</div>
                                <div className="space-y-2">
                                    {headings.slice(0, 12).map((h) => (
                                        <a
                                            key={h.id}
                                            href={`#${h.id}`}
                                            className={[
                                                "block text-sm text-muted-foreground hover:text-foreground transition",
                                                h.level === 3 ? "pl-3" : "",
                                            ].join(" ")}
                                        >
                                            {h.text}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <div className="font-bold text-lg">🚀 Compare AI Tools</div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Explore tools, pricing, and categories — made for fast decisions.
                            </p>
                            <Link
                                href="/tools"
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                            >
                                Browse Tools →
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}
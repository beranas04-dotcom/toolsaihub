"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";

function fmtDate(d?: string) {
    const ms = Date.parse(d || "");
    if (!Number.isFinite(ms)) return "";
    return new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function ogImg(title: string) {
    return `/api/og?title=${encodeURIComponent(title)}`;
}

export default function BlogIndexClient({ posts }: { posts: BlogPost[] }) {
    const [q, setQ] = useState("");
    const [tag, setTag] = useState<string>("all");
    const [sort, setSort] = useState<"newest" | "featured">("featured");

    const tags = useMemo(() => {
        const map = new Map<string, number>();
        posts.forEach((p) => (p.tags || []).forEach((t) => map.set(String(t), (map.get(String(t)) || 0) + 1)));
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([t]) => t);
    }, [posts]);

    const featured = useMemo(() => {
        const f = posts.find((p) => Boolean(p.featured));
        return f || posts[0] || null;
    }, [posts]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        let list = posts.slice();

        if (sort === "featured") {
            list.sort(
                (a, b) =>
                    (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
                    (Date.parse(b.date || "1970-01-01") - Date.parse(a.date || "1970-01-01"))
            );
        } else {
            list.sort((a, b) => Date.parse(b.date || "1970-01-01") - Date.parse(a.date || "1970-01-01"));
        }

        if (tag !== "all") {
            list = list.filter((p) => (p.tags || []).map(String).includes(tag));
        }

        if (qq) {
            list = list.filter((p) => {
                const hay = `${p.title} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase();
                return hay.includes(qq);
            });
        }

        return list;
    }, [posts, q, tag, sort]);

    const rest = filtered.filter((p) => p.slug !== featured?.slug);

    return (
        <div className="space-y-10">
            {/* Top controls */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search articles (SEO, tools, comparisons...)"
                            className="w-full rounded-2xl border border-border bg-card px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ⌘K
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setSort("featured")}
                        className={`px-4 py-2 rounded-xl border border-border text-sm transition ${sort === "featured"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:border-primary/60"
                            }`}
                    >
                        Recommended
                    </button>
                    <button
                        type="button"
                        onClick={() => setSort("newest")}
                        className={`px-4 py-2 rounded-xl border border-border text-sm transition ${sort === "newest"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:border-primary/60"
                            }`}
                    >
                        Newest
                    </button>
                </div>
            </div>

            {/* Tags */}
            {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setTag("all")}
                        className={`text-xs px-3 py-1.5 rounded-full border border-border transition ${tag === "all"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:border-primary/60 text-muted-foreground"
                            }`}
                    >
                        All
                    </button>

                    {tags.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTag(t)}
                            className={`text-xs px-3 py-1.5 rounded-full border border-border transition ${tag === t
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card hover:border-primary/60 text-muted-foreground"
                                }`}
                        >
                            #{t}
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Featured */}
            {featured ? (
                <Link
                    href={`/blog/${featured.slug}`}
                    className="group grid md:grid-cols-[1.3fr_1fr] gap-6 rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-lg transition"
                >
                    <div className="p-6 md:p-8">
                        <div className="inline-flex items-center gap-2 text-xs rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
                            ⭐ Featured <span className="opacity-60">·</span> <span>{featured.readingMinutes} min read</span>
                        </div>

                        <h2 className="mt-4 text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition">
                            {featured.title}
                        </h2>

                        <p className="mt-3 text-muted-foreground line-clamp-2">{featured.description}</p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Read article <span className="transition group-hover:translate-x-0.5">→</span>
                        </div>
                    </div>

                    <div className="relative min-h-[220px] bg-muted">
                        <Image
                            src={featured.image ? featured.image : ogImg(featured.title)}
                            alt={featured.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 520px"
                            unoptimized={!featured.image} // ✅ OG fallback بدون domains config
                            priority={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    </div>
                </Link>
            ) : null}

            {/* Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rest.map((p) => (
                    <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-md transition"
                    >
                        <div className="relative aspect-video bg-muted">
                            <Image
                                src={p.image ? p.image : ogImg(p.title)}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                unoptimized={!p.image}
                                priority={false}
                            />
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{fmtDate(p.date)}</span>
                                <span>{p.readingMinutes} min</span>
                            </div>

                            <h3 className="mt-2 font-bold text-lg leading-snug group-hover:text-primary transition line-clamp-2">
                                {p.title}
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>

                            {(p.tags || []).length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(p.tags || []).slice(0, 3).map((t) => (
                                        <span
                                            key={t}
                                            className="text-[11px] px-2 py-1 rounded-full border border-border bg-muted/40 text-muted-foreground"
                                        >
                                            {String(t)}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <div className="rounded-3xl border border-border bg-primary/5 p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <div className="text-2xl font-bold">Get new AI tool picks weekly</div>
                    <p className="mt-1 text-muted-foreground">Short, actionable, and built for creators + marketers.</p>
                </div>
                <Link
                    href="/tools"
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                    Explore Tools →
                </Link>
            </div>
        </div>
    );
}
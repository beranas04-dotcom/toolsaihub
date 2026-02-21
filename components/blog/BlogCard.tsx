import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";

export default function BlogCard({ post }: { post: BlogPost }) {
    const dateLabel = post.date ? new Date(post.date).toLocaleDateString() : "";

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-md transition"
        >
            {/* Cover */}
            <div className="relative h-44 bg-muted/30">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                {post.featured ? (
                    <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        Featured
                    </div>
                ) : null}
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{dateLabel}</span>
                    <span>•</span>
                    <span>{post.readingMinutes} min read</span>
                </div>

                <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition">
                    {post.title}
                </h3>

                {post.description ? (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                    </p>
                ) : null}

                {/* Tags */}
                {(post.tags || []).length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {(post.tags || []).slice(0, 4).map((t) => (
                            <span
                                key={t}
                                className="text-[11px] px-2 py-1 rounded-full border border-border bg-background text-muted-foreground"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                ) : null}

                <div className="mt-5 text-sm font-semibold text-primary">
                    Read → <span className="inline-block transition group-hover:translate-x-0.5">→</span>
                </div>
            </div>
        </Link>
    );
}

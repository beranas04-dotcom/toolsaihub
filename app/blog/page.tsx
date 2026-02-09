import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 3600;

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-bold font-display">Blog</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Guides, comparisons, and practical workflows to pick the right AI tools.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                    <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:border-primary/50 transition"
                    >
                        <div className="text-sm text-muted-foreground">
                            {p.date ? p.date.slice(0, 10) : "—"} • {p.readingMinutes} min read
                        </div>
                        <div className="mt-2 text-lg font-semibold">{p.title}</div>
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
                            {p.description}
                        </div>

                        {p.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {p.tags.slice(0, 6).map((t) => (
                                    <span
                                        key={t}
                                        className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    No posts yet. Add your first file in <code>content/blog</code>.
                </div>
            )}
        </main>
    );
}

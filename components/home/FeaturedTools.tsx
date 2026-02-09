import Link from "next/link";
import type { Tool } from "@/types";

export default function FeaturedTools({ tools }: { tools: Tool[] }) {
    if (!tools.length) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⭐ Featured AI Tools</h2>
                <Link
                    href="/tools"
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View all →
                </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tools.map((t) => (
                    <Link
                        key={t.id}
                        href={`/tools/${t.slug || t.id}`}
                        className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-md transition"
                    >
                        <div className="text-lg font-semibold group-hover:text-primary">
                            {t.name}
                        </div>

                        {t.tagline && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {t.tagline}
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            {t.category && (
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {t.category}
                                </span>
                            )}
                            {t.pricing && (
                                <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                    {t.pricing}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 text-sm font-semibold text-primary">
                            View details →
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

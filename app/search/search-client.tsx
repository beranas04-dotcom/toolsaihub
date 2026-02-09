"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type SearchItem = {
    id: string;
    name: string;
    category?: string;
    description?: string;
    tags?: string[];
};

type SearchIndexResponse =
    | SearchItem[]
    | {
        tools?: SearchItem[];
    };

export default function SearchClient() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState<SearchItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/search-index.json", { cache: "no-store" });
                const data = (await res.json()) as SearchIndexResponse;

                const toolsArray = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.tools)
                        ? data.tools
                        : [];

                if (!cancelled) setItems(toolsArray);
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setLoaded(true);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const results = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return [];

        return items
            .filter((t) => {
                const haystack = [t.name, t.category, t.description, ...(t.tags || [])]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return haystack.includes(query);
            })
            .slice(0, 30);
    }, [q, items]);

    const submitSearchEvent = () => {
        const query = q.trim();
        if (!query) return;

        trackEvent("search_query", {
            q: query,
            results_count: results.length,
        });
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Search</h1>
                <p className="text-muted-foreground">
                    Find tools by name, category, or keywords.
                </p>
            </div>

            <div className="mb-8">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearchEvent();
                    }}
                    placeholder="Search tools… (e.g. writing, SEO, image)"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <div className="mt-2 text-sm text-muted-foreground">
                    {loaded ? `${items.length} tools indexed` : "Loading index…"}
                </div>
            </div>

            {q.trim() && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((t) => (
                        <Link
                            key={t.id}
                            href={`/tools/${t.id}`}
                            className="block rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition"
                        >
                            <div className="font-semibold text-lg">{t.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {t.category || "Uncategorized"}
                            </div>
                            {t.description && (
                                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                                    {t.description}
                                </p>
                            )}
                            {t.tags?.length ? (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {t.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </Link>
                    ))}
                </div>
            )}

            {!q.trim() && (
                <div className="text-muted-foreground">
                    Type something to start searching.
                </div>
            )}

            {q.trim() && loaded && results.length === 0 && (
                <div className="text-muted-foreground">No results found.</div>
            )}
        </div>
    );
}

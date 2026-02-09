"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";

type SearchTool = {
    id: string;
    slug?: string;
    name: string;
    tagline?: string;
    description?: string;
    category?: string;
    tags?: string[];
    pricing?: string;
    logo?: string;
};

type SearchIndex = {
    tools: SearchTool[];
    generatedAt?: string;
};

export default function SearchClient() {
    const [q, setQ] = useState("");
    const [index, setIndex] = useState<SearchIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                setErr(null);

                // ✅ مهم: كنقرا مباشرة من public
                const res = await fetch("/search-index.json", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`Failed to load /search-index.json (HTTP ${res.status})`);
                }

                const data = (await res.json()) as SearchIndex;
                if (!data?.tools?.length) {
                    throw new Error("search-index.json loaded but contains no tools.");
                }

                if (alive) setIndex(data);
            } catch (e: any) {
                if (alive) setErr(e?.message || "Failed to load search index");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, []);

    const fuse = useMemo(() => {
        if (!index?.tools?.length) return null;
        return new Fuse(index.tools, {
            threshold: 0.35,
            ignoreLocation: true,
            keys: [
                { name: "name", weight: 0.35 },
                { name: "tagline", weight: 0.25 },
                { name: "description", weight: 0.2 },
                { name: "category", weight: 0.1 },
                { name: "tags", weight: 0.1 },
            ],
        });
    }, [index]);

    const results = useMemo(() => {
        const tools = index?.tools || [];
        const query = q.trim();

        if (!query) return tools.slice(0, 30);

        if (!fuse) return [];
        return fuse.search(query).map((r) => r.item).slice(0, 50);
    }, [q, fuse, index]);

    if (loading) {
        return <div className="mt-4">Loading…</div>;
    }

    if (err) {
        return (
            <div className="mt-4">
                <div className="text-red-600 font-medium mb-2">{err}</div>
                <div className="text-sm text-muted-foreground">
                    تأكد أن <code className="px-1 py-0.5 rounded bg-muted">public/search-index.json</code> كاين ومولّد بصيغة JSON صحيحة.
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="max-w-3xl">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search tools…"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                />
                <div className="text-sm text-muted-foreground mt-2">
                    Indexed: {index?.tools?.length || 0} tools
                    {index?.generatedAt ? ` • generatedAt: ${new Date(index.generatedAt).toLocaleString()}` : ""}
                </div>
            </div>

            <div className="mt-6 grid gap-3 max-w-3xl">
                {results.map((t) => {
                    const slug = t.slug || t.id;
                    return (
                        <Link
                            key={t.id}
                            href={`/tools/${slug}`}
                            className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-semibold text-lg">{t.name}</div>
                                    <div className="text-sm text-muted-foreground">{t.tagline || t.description || ""}</div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        {t.category ? (
                                            <span className="px-2 py-1 rounded-full bg-muted">{t.category}</span>
                                        ) : null}
                                        {t.pricing ? (
                                            <span className="px-2 py-1 rounded-full bg-muted">{t.pricing}</span>
                                        ) : null}
                                        {(t.tags || []).slice(0, 4).map((tag) => (
                                            <span key={tag} className="px-2 py-1 rounded-full bg-muted">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">{slug}</div>
                            </div>
                        </Link>
                    );
                })}

                {!results.length && (
                    <div className="text-sm text-muted-foreground">
                        No results for <span className="font-medium">{q}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

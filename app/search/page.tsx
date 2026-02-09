"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";

type SearchTool = {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    category: string;
    tags: string[];
    pricing: string;
    logo?: string;
};

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState<SearchTool[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/search-index", { cache: "no-store" });

                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load search data");
                if (cancelled) return;

                setTools(Array.isArray(data?.tools) ? data.tools : []);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const fuse = useMemo(() => {
        return new Fuse(tools, {
            includeScore: true,
            threshold: 0.35,
            keys: [
                { name: "name", weight: 0.5 },
                { name: "tagline", weight: 0.25 },
                { name: "description", weight: 0.15 },
                { name: "category", weight: 0.05 },
                { name: "tags", weight: 0.05 },
            ],
        });
    }, [tools]);

    const results = useMemo(() => {
        const term = q.trim();
        if (!term) return tools.slice(0, 30);
        return fuse.search(term).map((r) => r.item).slice(0, 50);
    }, [q, fuse, tools]);

    return (
        <div className="container mx-auto px-6 py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Search</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Search tools from Firestore.
            </p>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tools…"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background mb-6"
            />

            {loading && <div>Loading…</div>}
            {error && (
                <div className="text-red-500">
                    {error}
                    <div className="text-xs text-muted-foreground mt-2">
                        Check: /api/search-index
                    </div>
                </div>
            )}

            {!loading && !error && results.length === 0 && (
                <div>No results.</div>
            )}

            <div className="space-y-3">
                {results.map((t) => (
                    <Link
                        key={t.id}
                        href={`/tools/${t.slug || t.id}`}
                        className="block rounded-2xl border border-border p-4 bg-card hover:border-primary/60 transition"
                    >
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.tagline}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                            {t.category} · {t.pricing}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

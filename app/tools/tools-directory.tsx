"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { Tool } from "@/types";

type SortKey = "az" | "featured";

function uniq(arr: string[]) {
    return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-xs px-2 py-1 rounded-full border border-border bg-background text-muted-foreground">
            {children}
        </span>
    );
}

function Pill({
    children,
    variant = "neutral",
}: {
    children: React.ReactNode;
    variant?: "primary" | "neutral" | "success";
}) {
    const cls =
        variant === "primary"
            ? "bg-primary/10 text-primary"
            : variant === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted text-muted-foreground";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
            {children}
        </span>
    );
}

export default function ToolsDirectory({ tools }: { tools: Tool[] }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [freeTrialOnly, setFreeTrialOnly] = useState(false);
    const [sort, setSort] = useState<SortKey>("featured");

    const categories = useMemo(() => {
        const list = tools.map((t) => t.category).filter(Boolean) as string[];
        return ["all", ...uniq(list)];
    }, [tools]);

    // ⚡ Fuse setup
    const fuse = useMemo(() => {
        return new Fuse(tools, {
            threshold: 0.35,
            keys: [
                { name: "name", weight: 0.4 },
                { name: "tagline", weight: 0.2 },
                { name: "description", weight: 0.2 },
                { name: "category", weight: 0.1 },
                { name: "tags", weight: 0.1 },
            ],
        });
    }, [tools]);

    const filtered = useMemo(() => {
        let list = tools.slice();

        // category
        if (category !== "all") {
            list = list.filter((t) => t.category === category);
        }

        // free trial
        if (freeTrialOnly) {
            list = list.filter((t) => t.freeTrial);
        }

        // 🔎 fuzzy search
        if (query.trim()) {
            const results = fuse.search(query.trim());
            list = results.map((r) => r.item);
        }

        // sort
        if (sort === "featured") {
            list.sort((a, b) => {
                const fa = a.featured ? 1 : 0;
                const fb = b.featured ? 1 : 0;
                if (fb !== fa) return fb - fa;
                return a.name.localeCompare(b.name);
            });
        } else {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }

        return list;
    }, [tools, query, category, freeTrialOnly, sort, fuse]);

    return (
        <main className="container mx-auto px-4 py-10 max-w-7xl">
            {/* Header */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm mb-10">
                <h1 className="text-4xl font-bold">AI Tools Directory</h1>
                <p className="text-muted-foreground mt-2">
                    Discover the best AI tools for every use case.
                </p>

                <div className="mt-6 grid md:grid-cols-3 gap-3">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tools…"
                        className="md:col-span-2 px-4 py-3 rounded-xl border border-border bg-background"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-border bg-background"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c === "all" ? "All categories" : c}
                            </option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 text-sm md:col-span-3">
                        <input
                            type="checkbox"
                            checked={freeTrialOnly}
                            onChange={(e) => setFreeTrialOnly(e.target.checked)}
                        />
                        Free trial only
                    </label>
                </div>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((t) => (
                    <Link
                        key={t.id}
                        href={`/tools/${t.slug || t.id}`}
                        className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-md transition"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-lg font-semibold group-hover:text-primary">
                                    {t.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {t.tagline}
                                </div>
                            </div>
                            {t.freeTrial && <Pill variant="success">Free trial</Pill>}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {t.category && <Pill variant="primary">{t.category}</Pill>}
                            {t.pricing && <Pill>{t.pricing}</Pill>}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {(t.tags || []).slice(0, 4).map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                            ))}
                        </div>

                        <div className="mt-6 text-sm font-semibold text-primary">
                            View details →
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}

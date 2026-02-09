"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";

type ToolLite = {
    id: string;
    slug?: string;
    name: string;
    tagline?: string;
    category?: string;
    pricing?: string;
    tags?: string[];
};

type Props = {
    categories: string[];
    toolsIndex: ToolLite[];
};

const PRICING_OPTIONS = [
    { value: "", label: "All pricing" },
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
    { value: "subscription", label: "Subscription" },
    { value: "credits", label: "Credits-based" },
];

const SORT_OPTIONS = [
    { value: "featured", label: "Recommended" },
    { value: "az", label: "A → Z" },
    { value: "newest", label: "Newest" },
];

export default function ToolsFilters({ categories, toolsIndex }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const currentCategory = sp.get("category") || "";
    const currentPricing = sp.get("pricing") || "";
    const currentSort = sp.get("sort") || "featured";

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);

    const searchWrapRef = useRef<HTMLDivElement | null>(null);

    const categoryOptions = useMemo(() => {
        const base = [{ value: "", label: "All categories" }];
        const rest = categories.map((c) => ({ value: c, label: c }));
        return base.concat(rest);
    }, [categories]);

    function setParam(key: string, value: string) {
        const params = new URLSearchParams(sp.toString());

        // sort: hide default
        if (key === "sort" && (value === "featured" || !value)) {
            params.delete("sort");
        } else {
            if (!value) params.delete(key);
            else params.set(key, value);
        }

        // reset pagination on any filter change
        params.delete("page");

        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    function resetAll() {
        setQ("");
        setOpen(false);
        router.push(pathname);
    }

    const fuse = useMemo(() => {
        return new Fuse(toolsIndex, {
            includeScore: true,
            threshold: 0.35,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
                { name: "name", weight: 0.55 },
                { name: "tagline", weight: 0.2 },
                { name: "category", weight: 0.15 },
                { name: "tags", weight: 0.1 },
            ],
        });
    }, [toolsIndex]);

    const results = useMemo(() => {
        const query = q.trim();
        if (!query) return [];
        return fuse.search(query).slice(0, 8).map((r) => r.item);
    }, [q, fuse]);

    function goToTool(t: ToolLite) {
        setQ("");
        setOpen(false);
        router.push(`/tools/${t.slug || t.id}`);
    }

    // ✅ close dropdown when clicking outside + Esc
    useEffect(() => {
        function onMouseDown(e: MouseEvent) {
            const el = searchWrapRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    {/* Search */}
                    <div className="text-sm w-full sm:w-[360px] max-w-full">
                        <div className="font-semibold mb-1">Search</div>

                        <div className="relative" ref={searchWrapRef}>
                            <input
                                value={q}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setQ(v);
                                    setOpen(v.trim().length >= 2);
                                }}
                                onFocus={() => {
                                    if (q.trim().length >= 2) setOpen(true);
                                }}
                                placeholder="Search tools (e.g., Canva, Jasper, video...)"
                                className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                            />

                            {open && results.length > 0 && (
                                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                                    <div className="max-h-[320px] overflow-auto">
                                        {results.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => goToTool(t)}
                                                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition"
                                            >
                                                <div className="font-semibold">{t.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {(t.tagline || t.category || "").toString()}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {t.category ? (
                                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                                            {t.category}
                                                        </span>
                                                    ) : null}
                                                    {t.pricing ? (
                                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {t.pricing}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                                        Click outside or press Esc to close.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <label className="text-sm">
                        <div className="font-semibold mb-1">Category</div>
                        <select
                            value={currentCategory}
                            onChange={(e) => setParam("category", e.target.value)}
                            className="w-56 max-w-full px-3 py-2 rounded-xl border border-border bg-background"
                        >
                            {categoryOptions.map((o) => (
                                <option key={o.value || "all"} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Pricing */}
                    <label className="text-sm">
                        <div className="font-semibold mb-1">Pricing</div>
                        <select
                            value={currentPricing}
                            onChange={(e) => setParam("pricing", e.target.value)}
                            className="w-56 max-w-full px-3 py-2 rounded-xl border border-border bg-background"
                        >
                            {PRICING_OPTIONS.map((o) => (
                                <option key={o.value || "all"} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Sort */}
                    <label className="text-sm">
                        <div className="font-semibold mb-1">Sort</div>
                        <select
                            value={currentSort}
                            onChange={(e) => setParam("sort", e.target.value)}
                            className="w-56 max-w-full px-3 py-2 rounded-xl border border-border bg-background"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetAll}
                        className="px-4 py-2 rounded-xl border border-border bg-background hover:border-primary/60 transition text-sm font-semibold"
                    >
                        Reset
                    </button>
                    <div className="text-xs text-muted-foreground">
                        Fuse.js fuzzy search (dropdown).
                    </div>
                </div>
            </div>
        </section>
    );
}

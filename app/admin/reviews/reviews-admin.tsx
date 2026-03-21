"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewRow = {
    id: string;
    toolId?: string;
    toolSlug?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    rating?: number;
    title?: string;
    content?: string;
    published?: boolean;
    featured?: boolean;
    createdAt?: number | string;
    updatedAt?: number | string;
};

type FilterMode = "all" | "published" | "hidden" | "featured";

function formatDate(v?: number | string) {
    if (!v) return "-";
    const d = typeof v === "number" ? new Date(v) : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

function Stars({ value }: { value?: number }) {
    const n = Math.max(0, Math.min(5, Number(value || 0)));
    return <span>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function ReviewsAdmin() {
    const [items, setItems] = useState<ReviewRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<FilterMode>("all");
    const [busyId, setBusyId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let list = [...items];

        if (filter === "published") list = list.filter((x) => x.published);
        if (filter === "hidden") list = list.filter((x) => !x.published);
        if (filter === "featured") list = list.filter((x) => x.featured);

        const s = q.trim().toLowerCase();
        if (!s) return list;

        return list.filter((r) => {
            const hay = `${r.toolSlug || r.toolId || ""} ${r.userName || ""} ${r.userEmail || ""} ${r.title || ""} ${r.content || ""}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q, filter]);

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reviews/list", {
                cache: "no-store",
                credentials: "include",
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Failed to load reviews");
            setItems(Array.isArray(j?.items) ? j.items : []);
        } catch (e: any) {
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }

    async function quickUpdate(id: string, patch: Partial<ReviewRow>) {
        setBusyId(id);

        setItems((prev) =>
            prev.map((x) => (x.id === id ? { ...x, ...patch } : x))
        );

        try {
            const res = await fetch("/api/admin/reviews/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id, ...patch }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Update failed");
        } catch (e: any) {
            alert(e?.message || "Update failed");
            await load();
        } finally {
            setBusyId(null);
        }
    }

    async function deleteReview(id: string) {
        const yes = window.confirm("Are you sure you want to delete this review?");
        if (!yes) return;

        setBusyId(id);
        try {
            const res = await fetch("/api/admin/reviews/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Delete failed");

            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            alert(e?.message || "Delete failed");
        } finally {
            setBusyId(null);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by tool, email, title, content..."
                        className="w-full md:w-[340px] rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterMode)}
                        className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="hidden">Hidden</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>

                <button
                    onClick={load}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted/30"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="mt-6 text-sm text-muted-foreground">Loading reviews…</div>
            ) : err ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {err}
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No reviews found.</div>
                    ) : (
                        filtered.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-2xl border border-border/60 bg-background/30 p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0 max-w-4xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-semibold">
                                                {r.title || "Untitled review"}
                                            </div>
                                            <span className="text-sm text-yellow-400">
                                                <Stars value={r.rating} />
                                            </span>
                                        </div>

                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Tool: {r.toolSlug || r.toolId || "-"} • User: {r.userName || "Anonymous"}{" "}
                                            {r.userEmail ? `(${r.userEmail})` : ""}
                                        </div>

                                        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                            {r.content || "No content"}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                                                {r.published ? "Published" : "Hidden"}
                                            </span>

                                            {r.featured ? (
                                                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">
                                                    Featured
                                                </span>
                                            ) : null}

                                            <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                                                {formatDate(r.updatedAt || r.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => quickUpdate(r.id, { published: !r.published })}
                                            disabled={busyId === r.id}
                                            className={[
                                                "rounded-2xl px-4 py-2 text-sm font-semibold",
                                                r.published
                                                    ? "border border-border bg-background hover:bg-muted/30"
                                                    : "bg-primary text-white hover:opacity-95",
                                            ].join(" ")}
                                        >
                                            {r.published ? "Hide" : "Publish"}
                                        </button>

                                        <button
                                            onClick={() => quickUpdate(r.id, { featured: !r.featured })}
                                            disabled={busyId === r.id}
                                            className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/30"
                                        >
                                            {r.featured ? "Unfeature" : "Feature"}
                                        </button>

                                        <button
                                            onClick={() => deleteReview(r.id)}
                                            disabled={busyId === r.id}
                                            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
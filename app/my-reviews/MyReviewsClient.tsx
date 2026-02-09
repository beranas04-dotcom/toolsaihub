"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

type Item = {
    id: string;
    toolId: string;
    toolName?: string;
    rating: number;
    title?: string;
    text?: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: string | null;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function Stars({ value }: { value: number }) {
    const v = clamp(value || 0, 0, 5);
    const full = Math.floor(v);
    const empty = 5 - full;

    return (
        <span className="inline-flex items-center gap-1 text-primary">
            {Array.from({ length: full }).map((_, i) => (
                <span key={`f${i}`} aria-hidden="true">
                    ★
                </span>
            ))}
            <span className="text-muted-foreground/30" aria-hidden="true">
                {Array.from({ length: empty }).map((_, i) => (
                    <span key={`e${i}`}>★</span>
                ))}
            </span>
        </span>
    );
}

function StatusBadge({ status }: { status: Item["status"] }) {
    const cls =
        status === "approved"
            ? "bg-green-500/15 text-green-400 border-green-500/20"
            : status === "rejected"
                ? "bg-red-500/15 text-red-400 border-red-500/20"
                : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";

    const label = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";

    return (
        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${cls}`}>
            {label}
        </span>
    );
}

function safeDateLabel(createdAt?: string | null) {
    if (!createdAt) return "";
    const ms = Date.parse(createdAt);
    if (!Number.isFinite(ms)) return "";
    return new Date(ms).toLocaleString();
}

export default function MyReviewsClient() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<"all" | Item["status"]>("all");

    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                setErr(null);
                setLoading(true);

                const u = auth.currentUser;
                if (!u) {
                    setItems([]);
                    setLoading(false);
                    router.replace("/auth/signin");
                    return;
                }

                const token = await u.getIdToken();
                const res = await fetch("/api/my-reviews", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Failed to load reviews.");

                setItems(Array.isArray(data.items) ? data.items : []);
            } catch (e: any) {
                setErr(e?.message || "Error");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [router]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();

        return items.filter((r) => {
            const statusOk = status === "all" ? true : r.status === status;
            if (!statusOk) return false;

            if (!qq) return true;

            const hay = `${r.toolName || ""} ${r.toolId || ""} ${r.title || ""} ${r.text || ""}`.toLowerCase();
            return hay.includes(qq);
        });
    }, [items, q, status]);

    const counts = useMemo(() => {
        const c = { all: items.length, approved: 0, pending: 0, rejected: 0 };
        for (const r of items) c[r.status] += 1;
        return c;
    }, [items]);

    return (
        <main className="container mx-auto px-6 py-10 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My Reviews</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        كتلقى هنا جميع reviews اللي كتبتي. المجموع:{" "}
                        <span className="font-semibold text-foreground">{items.length}</span>
                    </p>
                </div>

                <Link
                    href="/tools"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition font-semibold"
                >
                    Browse tools →
                </Link>
            </div>

            {/* Controls */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 mb-6">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search your reviews… (tool, title, text)"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background"
                    />

                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                ["all", `All (${counts.all})`],
                                ["approved", `Approved (${counts.approved})`],
                                ["pending", `Pending (${counts.pending})`],
                                ["rejected", `Rejected (${counts.rejected})`],
                            ] as const
                        ).map(([key, label]) => {
                            const active = status === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setStatus(key)}
                                    className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${active
                                            ? "border-primary/40 bg-primary/10 text-primary"
                                            : "border-border bg-background hover:border-primary/40"
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
            {err ? <div className="text-sm text-red-500">{err}</div> : null}

            {!loading && !err && filtered.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8">
                    <div className="text-lg font-semibold mb-2">ما لقينا حتى review بهاذ الفلتر.</div>
                    <div className="text-sm text-muted-foreground mb-5">
                        إلا مازال ماكتبتي حتى review، سير لأي tool وكتب رأيك.
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                        >
                            Browse tools →
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setQ("");
                                setStatus("all");
                            }}
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition font-semibold"
                        >
                            Reset filters
                        </button>
                    </div>
                </div>
            ) : null}

            {/* List */}
            <div className="space-y-4">
                {filtered.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-semibold text-lg">
                                        {r.toolName || r.toolId}
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>

                                <div className="mt-2 flex items-center gap-3">
                                    <Stars value={Number(r.rating || 0)} />
                                    <span className="text-xs text-muted-foreground">
                                        {Number(r.rating || 0).toFixed(1)} / 5
                                    </span>
                                </div>

                                {r.title ? <div className="mt-3 font-medium">{r.title}</div> : null}
                                {r.text ? (
                                    <p className="mt-2 text-sm text-muted-foreground leading-6">
                                        {r.text}
                                    </p>
                                ) : null}

                                {r.createdAt ? (
                                    <div className="mt-3 text-xs text-muted-foreground">
                                        {safeDateLabel(r.createdAt)}
                                    </div>
                                ) : null}
                            </div>

                            <div className="shrink-0 flex flex-col gap-2 sm:items-end">
                                <Link
                                    href={`/tools/${r.toolId}`}
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                                >
                                    Edit on tool page →
                                </Link>

                                <Link
                                    href={`/tools/${r.toolId}#reviews`}
                                    className="text-sm font-semibold text-muted-foreground hover:text-primary transition"
                                >
                                    View tool reviews →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

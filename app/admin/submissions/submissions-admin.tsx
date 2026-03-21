"use client";

import { useEffect, useState } from "react";

type Submission = {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    website?: string;
    logo?: string;
    pricing?: string;
    createdAt?: number | string;
    email?: string;
    status?: string;
};

export default function SubmissionsAdmin() {
    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/admin/submissions/list", {
                cache: "no-store",
                credentials: "include",
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Failed to load submissions");
            setItems(Array.isArray(j?.items) ? j.items : []);
        } catch (e: any) {
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }

    async function approve(id: string) {
        try {
            setBusyId(id);
            const res = await fetch("/api/admin/submissions/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Approve failed");
            await load();
        } catch (e: any) {
            alert(e?.message || "Approve failed");
        } finally {
            setBusyId(null);
        }
    }

    async function reject(id: string) {
        try {
            setBusyId(id);
            const res = await fetch("/api/admin/submissions/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Reject failed");
            await load();
        } catch (e: any) {
            alert(e?.message || "Reject failed");
        } finally {
            setBusyId(null);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return <div className="text-sm text-muted-foreground">Loading submissions…</div>;
    }

    if (err) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">No pending submissions.</div>
            ) : (
                <div className="grid gap-4">
                    {items.map((s) => (
                        <div
                            key={s.id}
                            className="rounded-2xl border border-border/60 bg-background/30 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-extrabold">{s.name || "(no name)"}</h2>
                                    <p className="mt-1 text-xs text-muted-foreground">slug: {s.slug || "-"}</p>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                                        {s.description || "No description"}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {s.category ? (
                                            <span className="rounded-full border border-border px-2.5 py-1">
                                                {s.category}
                                            </span>
                                        ) : null}
                                        {s.pricing ? (
                                            <span className="rounded-full border border-border px-2.5 py-1">
                                                {s.pricing}
                                            </span>
                                        ) : null}
                                        {s.email ? (
                                            <span className="rounded-full border border-border px-2.5 py-1">
                                                {s.email}
                                            </span>
                                        ) : null}
                                    </div>

                                    {s.website ? (
                                        <a
                                            href={s.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-block text-sm underline text-muted-foreground hover:text-foreground"
                                        >
                                            Visit website
                                        </a>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => approve(s.id)}
                                        disabled={busyId === s.id}
                                        className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                                    >
                                        {busyId === s.id ? "Working..." : "Approve"}
                                    </button>

                                    <button
                                        onClick={() => reject(s.id)}
                                        disabled={busyId === s.id}
                                        className="rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted/30 disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
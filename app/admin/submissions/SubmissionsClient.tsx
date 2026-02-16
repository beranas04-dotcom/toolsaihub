"use client";

import { useMemo, useState } from "react";
import { approveSubmissionAction, rejectSubmissionAction } from "./actions";

type Submission = {
    id: string;
    name: string;
    website: string;
    tagline: string;
    description?: string;
    category: string;
    pricing: string;
    email: string;
    affiliateUrl?: string | null;
    logo?: string | null;
    tags?: string[];
    status: "pending" | "approved" | "rejected";
    createdAt?: string | null;
};

export default function SubmissionsClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
    const [items, setItems] = useState<Submission[]>(initialSubmissions);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const pendingCount = useMemo(() => items.length, [items]);

    async function approve(id: string) {
        setError(null);
        setBusyId(id);

        try {
            const res = await approveSubmissionAction(id);
            if (!res.ok) throw new Error((res as any).error || "Approve failed");

            // ✅ حيد من اللائحة
            setItems((prev) => prev.filter((x) => x.id !== id));

            // ✅ مشي مباشرة للتعديل ديال tool الجديد
            const toolId = (res as any).toolId as string | undefined;
            if (toolId) {
                window.location.href = `/admin/tools/edit/${toolId}`;
                return;
            }
        } catch (e: any) {
            setError(e?.message || "Something went wrong");
        } finally {
            setBusyId(null);
        }
    }

    async function reject(id: string) {
        setError(null);
        const reason = prompt("Reject reason (optional):") || "";
        setBusyId(id);
        try {
            const res = await rejectSubmissionAction(id, reason);
            if (!res.ok) throw new Error((res as any).error || "Reject failed");
            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            setError(e?.message || "Something went wrong");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Submissions</h1>
                    <p className="text-sm text-muted-foreground">{pendingCount} pending</p>
                </div>
            </div>

            {error ? (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-4">
                {items.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold text-lg truncate">{s.name}</div>
                                    <span className="text-xs rounded-full bg-muted px-2 py-1">{s.category}</span>
                                    <span className="text-xs rounded-full bg-muted px-2 py-1">{s.pricing}</span>
                                </div>

                                <a href={s.website} target="_blank" className="text-sm text-primary hover:underline break-all">
                                    {s.website}
                                </a>

                                <div className="mt-2 text-sm text-muted-foreground">{s.tagline}</div>

                                {s.tags?.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {s.tags.map((t) => (
                                            <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                <div className="mt-3 text-xs text-muted-foreground">
                                    Contact: <span className="font-medium">{s.email}</span>
                                    {s.createdAt ? (
                                        <span className="ml-2 opacity-70">• {new Date(s.createdAt).toLocaleString()}</span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex gap-2 sm:flex-col sm:min-w-[180px]">
                                <button
                                    disabled={busyId === s.id}
                                    onClick={() => approve(s.id)}
                                    className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                                >
                                    {busyId === s.id ? "..." : "Approve"}
                                </button>
                                <button
                                    disabled={busyId === s.id}
                                    onClick={() => reject(s.id)}
                                    className="rounded-xl border border-border bg-background px-4 py-2 font-semibold hover:bg-muted/40 disabled:opacity-60"
                                >
                                    {busyId === s.id ? "..." : "Reject"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {!items.length ? (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                        No pending submissions 🎉
                    </div>
                ) : null}
            </div>
        </main>
    );
}

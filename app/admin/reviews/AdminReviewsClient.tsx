"use client";

import { useMemo, useState } from "react";
import { getAuth } from "firebase/auth";

type Review = {
    id: string;
    toolId: string;
    toolName?: string;
    rating: number;
    title?: string;
    text?: string;
    status: "pending" | "approved" | "rejected";
    userId: string;
    userName?: string;
    userEmail?: string;
    createdAt?: any;
};

function Stars({ value }: { value: number }) {
    const v = Math.max(1, Math.min(5, value || 0));
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < v ? "text-yellow-400" : "text-muted-foreground/30"}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default function AdminReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
    const [busyId, setBusyId] = useState<string | null>(null);
    const count = useMemo(() => reviews.length, [reviews]);

    async function moderate(id: string, action: "approved" | "rejected") {
        try {
            setBusyId(id);

            const auth = getAuth();
            const u = auth.currentUser;
            if (!u) {
                alert("Sign in first.");
                return;
            }

            const token = await u.getIdToken(true);

            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action }),

            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed");

            // remove from list (pending page)
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } catch (e: any) {
            alert(e?.message || "Error");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="container mx-auto px-6 py-10 max-w-5xl">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Review Moderation</h1>
                    <p className="text-sm text-muted-foreground">Pending reviews: {count}</p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    No pending reviews 🎉
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="font-semibold">{r.toolName || r.toolId}</div>
                                        <span className="text-xs text-muted-foreground">({r.toolId})</span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-3">
                                        <Stars value={r.rating} />
                                        <span className="text-xs text-muted-foreground">
                                            by {r.userEmail || r.userName || r.userId}
                                        </span>
                                    </div>

                                    {r.title ? <div className="mt-3 font-medium">{r.title}</div> : null}
                                    {r.text ? (
                                        <p className="mt-2 text-sm text-muted-foreground leading-6">{r.text}</p>
                                    ) : null}
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button
                                        disabled={busyId === r.id}
                                        onClick={() => moderate(r.id, "approved")}
                                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        disabled={busyId === r.id}
                                        onClick={() => moderate(r.id, "rejected")}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

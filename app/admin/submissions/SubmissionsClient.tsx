"use client";

import { useMemo, useState } from "react";

type Submission = {
    id: string;
    toolName: string;
    websiteUrl: string;
    description?: string;
    category?: string;
    submitterEmail?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
};

export default function SubmissionsClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
    const [items, setItems] = useState<Submission[]>(initialSubmissions);
    const [busyId, setBusyId] = useState<string | null>(null);

    const hasItems = useMemo(() => items.length > 0, [items.length]);

    async function act(id: string, action: "approve" | "reject") {
        setBusyId(id);
        try {
            const res = await fetch(`/api/admin/submissions/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed");

            // remove item from UI
            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            alert(e?.message || "Action failed. Check Vercel logs.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin — Tool Submissions</h1>
                <p className="text-muted-foreground mt-2">
                    Approve a submission to create a <b>pending</b> tool, or reject it.
                </p>
            </div>

            {!hasItems ? (
                <div className="bg-muted/30 border border-border rounded-xl p-10 text-center">
                    <h2 className="text-xl font-semibold mb-2">No submissions</h2>
                    <p className="text-muted-foreground">New user submissions will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((s) => {
                        const busy = busyId === s.id;

                        return (
                            <div key={s.id} className="bg-card border border-border rounded-xl p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-xl font-bold">{s.toolName}</h2>
                                            <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">
                                                {s.status}
                                            </span>
                                        </div>

                                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                            <div>
                                                <span className="font-medium">Website:</span>{" "}
                                                <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {s.websiteUrl}
                                                </a>
                                            </div>
                                            <div><span className="font-medium">Category:</span> {s.category || "—"}</div>
                                            <div><span className="font-medium">Submitter:</span> {s.submitterEmail || "—"}</div>
                                        </div>

                                        {s.description ? (
                                            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{s.description}</p>
                                        ) : null}

                                        <div className="mt-4 text-xs text-muted-foreground">
                                            Submitted: {new Date(s.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            disabled={busy}
                                            onClick={() => act(s.id, "approve")}
                                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                                        >
                                            {busy ? "..." : "Approve"}
                                        </button>

                                        <button
                                            disabled={busy}
                                            onClick={() => act(s.id, "reject")}
                                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {busy ? "..." : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

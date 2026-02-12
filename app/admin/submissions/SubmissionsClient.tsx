"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Submission } from "@/lib/admin-submissions";

export default function SubmissionsClient({ initial }: { initial: Submission[] }) {
    const router = useRouter();
    const [items, setItems] = useState<Submission[]>(initial || []);
    const [busyId, setBusyId] = useState<string | null>(null);

    async function updateStatus(id: string, status: "approved" | "rejected") {
        setBusyId(id);
        try {
            const res = await fetch("/api/admin/submissions/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401) {
                router.replace("/admin/login");
                router.refresh();
                return;
            }

            if (!res.ok) throw new Error(data?.error || "Failed");

            setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Failed to update submission");
        } finally {
            setBusyId(null);
        }
    }

    if (!items.length) {
        return (
            <div className="bg-muted/30 border border-border rounded-xl p-10 text-center">
                <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
                <p className="text-muted-foreground">
                    When users submit tools, they will appear here.
                </p>
            </div>
        );
    }

    return (
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

                                <div className="text-sm text-muted-foreground mt-2">
                                    <div>
                                        <span className="font-medium">Website:</span>{" "}
                                        <a
                                            href={s.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {s.websiteUrl}
                                        </a>
                                    </div>
                                    <div className="mt-1">
                                        <span className="font-medium">Category:</span> {s.category || "—"}
                                    </div>
                                    <div className="mt-1">
                                        <span className="font-medium">Submitter:</span>{" "}
                                        {s.submitterEmail || "—"}
                                    </div>
                                </div>

                                {s.description ? (
                                    <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                                        {s.description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    disabled={busy}
                                    onClick={() => updateStatus(s.id, "approved")}
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                                >
                                    {busy ? "..." : "Approve"}
                                </button>

                                <button
                                    disabled={busy}
                                    onClick={() => updateStatus(s.id, "rejected")}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                                >
                                    {busy ? "..." : "Reject"}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-muted-foreground">
                            Created: {new Date(s.createdAt).toLocaleString()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

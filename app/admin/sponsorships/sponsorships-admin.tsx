"use client";

import { useEffect, useMemo, useState } from "react";

type StatusFilter = "all" | "pending_payment" | "paid" | "approved" | "rejected";

type Item = {
    id: string;
    toolId: string;
    toolName?: string;
    ownerName?: string;
    ownerEmail?: string;
    plan: string;
    amount?: number;
    currency?: string;
    status: string;
    notes?: string;
    createdAt?: number;
    updatedAt?: number;
    paidAt?: number;
    approvedAt?: number;
    rejectedAt?: number;
};

function formatDate(v?: number) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
    const cls =
        status === "approved"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
            : status === "paid"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
                : status === "rejected"
                    ? "border-red-500/30 bg-red-500/10 text-red-700"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-700";

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
            {status}
        </span>
    );
}

export default function SponsorshipsAdmin() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");

    async function load() {
        setLoading(true);
        setErr(null);

        try {
            const res = await fetch("/api/admin/sponsorships/list", {
                cache: "no-store",
                credentials: "include",
            });

            const j = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(j?.error || "Failed to load sponsorship requests");
            }

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

            const res = await fetch("/api/admin/sponsorships/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            const j = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(j?.error || "Approve failed");
            }

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

            const res = await fetch("/api/admin/sponsorships/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            const j = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(j?.error || "Reject failed");
            }

            await load();
        } catch (e: any) {
            alert(e?.message || "Reject failed");
        } finally {
            setBusyId(null);
        }
    }

    const filtered = useMemo(() => {
        let list = [...items];

        if (status !== "all") {
            list = list.filter((x) => x.status === status);
        }

        const s = q.trim().toLowerCase();
        if (!s) return list;

        return list.filter((x) => {
            const hay = `${x.toolId || ""} ${x.toolName || ""} ${x.ownerName || ""} ${x.ownerEmail || ""} ${x.plan || ""} ${x.status || ""}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q, status]);

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
                        placeholder="Search by tool, owner, email, plan..."
                        className="w-full md:w-[320px] rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as StatusFilter)}
                        className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">All statuses</option>
                        <option value="pending_payment">Pending payment</option>
                        <option value="paid">Paid</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
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
                <div className="mt-6 text-sm text-muted-foreground">Loading sponsorship requests…</div>
            ) : err ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {err}
                </div>
            ) : filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                    No sponsorship requests found.
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-border/60 bg-background/30 p-5"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="font-semibold text-lg">
                                            {item.toolName || item.toolId}
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Tool ID: <span className="text-foreground font-medium">{item.toolId}</span>
                                    </div>

                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Owner: <span className="text-foreground font-medium">{item.ownerName || "-"}</span>
                                        {item.ownerEmail ? <> • {item.ownerEmail}</> : null}
                                    </div>

                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Plan: <span className="text-foreground font-medium">{item.plan}</span>
                                        {typeof item.amount === "number" ? (
                                            <>
                                                {" "}• {item.amount} {item.currency || "USD"}
                                            </>
                                        ) : null}
                                    </div>

                                    {item.notes ? (
                                        <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                            {item.notes}
                                        </div>
                                    ) : null}

                                    <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                                        <div>Created: {formatDate(item.createdAt)}</div>
                                        <div>Updated: {formatDate(item.updatedAt)}</div>
                                        {item.paidAt ? <div>Paid: {formatDate(item.paidAt)}</div> : null}
                                        {item.approvedAt ? <div>Approved: {formatDate(item.approvedAt)}</div> : null}
                                        {item.rejectedAt ? <div>Rejected: {formatDate(item.rejectedAt)}</div> : null}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 lg:min-w-[180px]">
                                    <a
                                        href={`/tools/${encodeURIComponent(item.toolId)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border border-border bg-background px-4 py-2 text-center text-sm font-semibold hover:bg-muted/30"
                                    >
                                        Open tool
                                    </a>

                                    {item.status === "paid" ? (
                                        <button
                                            onClick={() => approve(item.id)}
                                            disabled={busyId === item.id}
                                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                                        >
                                            {busyId === item.id ? "Working..." : "Approve"}
                                        </button>
                                    ) : null}

                                    {item.status !== "approved" && item.status !== "rejected" ? (
                                        <button
                                            onClick={() => reject(item.id)}
                                            disabled={busyId === item.id}
                                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                                        >
                                            {busyId === item.id ? "Working..." : "Reject"}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
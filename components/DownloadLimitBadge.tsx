"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LimitApiResponse = {
    authenticated: boolean;
    plan?: "free" | "pro";
    dateKey?: string;
    uid?: { used: number; limit: number; remaining: number };
    ip?: { used: number; limit: number; remaining: number };
};

export default function DownloadLimitBadge() {
    const [data, setData] = useState<LimitApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    async function refresh() {
        try {
            setLoading(true);
            const res = await fetch("/api/download/limit", { cache: "no-store" });
            const json = (await res.json().catch(() => null)) as LimitApiResponse | null;
            if (json && typeof json === "object") setData(json);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    if (loading) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                Checking daily downloads…
            </div>
        );
    }

    if (!data?.authenticated) return null;

    const plan = data.plan || "free";
    const isPro = plan === "pro";

    const uidRemaining = data.uid?.remaining ?? 0;
    const uidLimit = data.uid?.limit ?? 0;

    const ipRemaining = data.ip?.remaining ?? 0;
    const ipLimit = data.ip?.limit ?? 0;

    // ✅ true remaining = الأقل بين uid و ip
    const remaining = Math.min(uidRemaining, ipRemaining);
    const limit = Math.min(uidLimit || Infinity, ipLimit || Infinity);

    const danger = remaining <= 0;
    const warn = remaining > 0 && limit !== Infinity && remaining <= Math.max(1, Math.floor(limit * 0.2));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                        danger
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : warn
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                                : "border-border bg-muted/30 text-muted-foreground",
                    ].join(" ")}
                >
                    <span
                        className={[
                            "h-2 w-2 rounded-full",
                            danger ? "bg-red-400" : warn ? "bg-yellow-400" : "bg-green-400",
                        ].join(" ")}
                    />
                    {isPro ? "Pro" : "Free"} • {remaining}/{limit === Infinity ? "∞" : limit} downloads left today
                </span>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-xs underline text-muted-foreground hover:text-foreground"
                >
                    {open ? "Hide usage" : "View usage"}
                </button>

                {!isPro && (
                    <Link href="/pricing" className="text-xs underline text-muted-foreground hover:text-foreground">
                        Upgrade to Pro
                    </Link>
                )}
            </div>

            {open && (
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-2">
                        <div>
                            <span className="text-foreground font-semibold">Plan:</span> {plan}
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                                <div className="text-foreground font-semibold">Account (UID)</div>
                                <div>Used: {data.uid?.used ?? 0}</div>
                                <div>Limit: {data.uid?.limit ?? 0}</div>
                                <div>Remaining: {data.uid?.remaining ?? 0}</div>
                            </div>

                            <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                                <div className="text-foreground font-semibold">Network (IP)</div>
                                <div>Used: {data.ip?.used ?? 0}</div>
                                <div>Limit: {data.ip?.limit ?? 0}</div>
                                <div>Remaining: {data.ip?.remaining ?? 0}</div>
                            </div>
                        </div>

                        <div>
                            <span className="text-foreground font-semibold">Date key:</span> {data.dateKey || "-"}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={refresh}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 font-semibold hover:bg-muted/40"
                        >
                            Refresh
                        </button>

                        {!isPro && (
                            <Link href="/pricing" className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:opacity-95">
                                Get Pro
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
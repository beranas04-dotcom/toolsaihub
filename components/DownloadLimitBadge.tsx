// components/DownloadLimitBadge.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LimitData = {
    ok: boolean;
    plan: "free" | "pro";
    dateKey: string;
    limit: number;
    count: number;
    remaining: number;
};

export default function DownloadLimitBadge() {
    const [data, setData] = useState<LimitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    async function refresh() {
        try {
            setLoading(true);
            const res = await fetch("/api/download/limit", { cache: "no-store" });
            const json = (await res.json().catch(() => null)) as LimitData | null;
            if (json && typeof json === "object") setData(json);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                Checking daily downloads…
            </div>
        );
    }

    if (!data?.ok) return null;

    const isPro = data.plan === "pro";
    const danger = data.remaining <= 0;
    const warn =
        data.remaining > 0 && data.remaining <= Math.max(1, Math.floor(data.limit * 0.2));

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
                    {isPro ? "Pro" : "Free"} • {data.remaining}/{data.limit} downloads left today
                </span>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-xs underline text-muted-foreground hover:text-foreground"
                >
                    {open ? "Hide usage" : "View usage"}
                </button>

                {!isPro && (
                    <Link
                        href="/pricing"
                        className="text-xs underline text-muted-foreground hover:text-foreground"
                    >
                        Upgrade to Pro
                    </Link>
                )}
            </div>

            {open && (
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <span>
                            <span className="text-foreground font-semibold">Plan:</span> {data.plan}
                        </span>
                        <span>
                            <span className="text-foreground font-semibold">Used today:</span> {data.count}
                        </span>
                        <span>
                            <span className="text-foreground font-semibold">Daily limit:</span> {data.limit}
                        </span>
                        <span>
                            <span className="text-foreground font-semibold">Date key:</span> {data.dateKey}
                        </span>
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
                            <Link
                                href="/pricing"
                                className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:opacity-95"
                            >
                                Get Pro
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
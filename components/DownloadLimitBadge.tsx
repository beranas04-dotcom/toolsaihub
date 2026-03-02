"use client";

import { useEffect, useState } from "react";

type LimitData = {
    ok: boolean;
    day?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    isProActive?: boolean;
    error?: string;
};

export default function DownloadLimitBadge() {
    const [data, setData] = useState<LimitData | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/download/limit", { cache: "no-store", credentials: "include" })
            .then((r) => r.json())
            .then((j) => {
                if (!cancelled) setData(j);
            })
            .catch(() => {
                if (!cancelled) setData({ ok: false });
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!data?.ok) return null;

    const remaining = data.remaining ?? 0;
    const limit = data.limit ?? 0;

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>
                Downloads today:{" "}
                <span className="font-semibold text-foreground">{remaining}</span>
                <span className="text-muted-foreground"> / {limit} left</span>
            </span>
        </div>
    );
}
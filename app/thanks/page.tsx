"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StatusResp = { ok: boolean; status: string };

async function fetchStatus(): Promise<StatusResp> {
    try {
        const res = await fetch("/api/subscription/status", { cache: "no-store" });
        if (!res.ok) return { ok: false, status: "none" };
        return (await res.json()) as StatusResp;
    } catch {
        return { ok: false, status: "none" };
    }
}

export default function ThanksPage() {
    const [status, setStatus] = useState<string>("activating");
    const [loading, setLoading] = useState(false);

    // Auto-poll for up to ~30s
    useEffect(() => {
        let tries = 0;
        let stopped = false;

        async function tick() {
            const data = await fetchStatus();
            if (stopped) return;

            if (data?.status) setStatus(data.status);

            // Stop polling if active or after 10 tries (≈ 30s)
            tries += 1;
            if (data.status === "active" || tries >= 10) return;

            setTimeout(tick, 3000);
        }

        tick();
        return () => {
            stopped = true;
        };
    }, []);

    const isActive = status === "active";
    const isInactive = status === "inactive";
    const isNone = status === "none";

    async function manualRefresh() {
        setLoading(true);
        const data = await fetchStatus();
        setStatus(data.status || "none");
        setLoading(false);
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-20">
            <section className="text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-green-50 dark:bg-green-900/20">
                    ✅
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Welcome to JLADAN Pro
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground">
                    Your checkout is complete. Your Pro access should activate shortly.
                </p>

                {/* Status pill */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span
                        className={[
                            "h-2 w-2 rounded-full",
                            isActive ? "bg-green-500" : isInactive || isNone ? "bg-red-500" : "bg-yellow-500",
                        ].join(" ")}
                    />
                    <span className="text-muted-foreground">
                        {isActive && "Status: Active ✅"}
                        {!isActive && !isInactive && !isNone && "Status: Activating… (auto-checking)"}
                        {isInactive && "Status: Inactive"}
                        {isNone && "Status: Not detected (try signing in again)"}
                    </span>
                </div>

                {/* Manual refresh */}
                <div className="mt-4">
                    <button
                        onClick={manualRefresh}
                        disabled={loading}
                        className="text-sm underline text-muted-foreground hover:text-foreground disabled:opacity-60"
                    >
                        {loading ? "Checking..." : "Refresh status"}
                    </button>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/library"
                        className="rounded-xl bg-primary px-8 py-3 font-semibold text-white hover:opacity-95 text-center"
                    >
                        Go to Library
                    </Link>

                    <Link
                        href="/pro"
                        className="rounded-xl border border-border px-8 py-3 font-semibold hover:bg-muted text-center"
                    >
                        Open Pro Dashboard
                    </Link>
                </div>

                <div className="mt-4">
                    <Link
                        href="/manage"
                        className="text-sm text-muted-foreground underline hover:text-foreground"
                    >
                        Manage subscription
                    </Link>
                </div>

                <div className="mt-10 mx-auto max-w-xl text-left rounded-2xl border border-border p-6 bg-muted/20">
                    <h2 className="text-lg font-bold">What to do next</h2>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>• Open the Library and download your first Pro kit/template.</li>
                        <li>• If status takes time, click “Refresh status”.</li>
                        <li>• Need help? Contact support from the footer.</li>
                    </ul>
                </div>

                <p className="mt-8 text-xs text-muted-foreground">
                    Tip: Make sure you’re logged in with the same Google account used at checkout.
                </p>
            </section>
        </main>
    );
}
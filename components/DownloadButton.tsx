"use client";

import { useState } from "react";

export default function DownloadButton({
    productId,
    className,
    label = "Download",
}: {
    productId: string;
    className?: string;
    label?: string;
}) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function handle() {
        setErr(null);
        setLoading(true);

        const url = `/api/download?productId=${encodeURIComponent(productId)}`;

        try {
            // Try to request first to catch JSON errors (429/401/403)
            const res = await fetch(url, { method: "GET" });

            if (!res.ok) {
                const j = await res.json().catch(() => null);
                setErr(j?.error || "Download failed");
                return;
            }

            // If ok, trigger real browser download
            window.location.href = url;
        } catch {
            setErr("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full">
            <button onClick={handle} disabled={loading} className={className}>
                {loading ? "Preparing…" : label}
            </button>

            {err ? (
                <p className="mt-2 text-xs text-red-400">{err}</p>
            ) : null}
        </div>
    );
}
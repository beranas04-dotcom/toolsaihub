"use client";

import Link from "next/link";
import DownloadButton from "@/components/DownloadButton";
import DownloadLimitBadge from "@/components/DownloadLimitBadge";
import type { Product, SystemItem } from "@/types/library";

function toLabel(s?: string) {
    if (!s) return "General";
    const x = s.replace(/[-_]/g, " ").trim();
    return x.charAt(0).toUpperCase() + x.slice(1);
}

function isNew(createdAt?: number) {
    if (!createdAt) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt <= sevenDays;
}

function DifficultyPill({ v }: { v?: SystemItem["difficulty"] }) {
    const val = v || "beginner";
    const label = val === "advanced" ? "Advanced" : val === "intermediate" ? "Intermediate" : "Beginner";
    return (
        <span className="text-[11px] rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
            {label}
        </span>
    );
}

export default function LibraryUI({
    systems,
    products,
    categories,
    q,
    rawQ,
    cat,
}: {
    systems: SystemItem[];
    products: Product[];
    categories: string[];
    q: string;
    rawQ: string;
    cat: string;
}) {
    const totalShown = systems.length + products.length;

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative">
            {/* Header */}
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Pro Library • Systems + Products
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    🔥 JLADAN Library
                </h1>

                <div className="mt-4">
                    <DownloadLimitBadge />
                </div>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    Step-by-step monetization systems + ready-to-use assets (templates, kits, prompts).
                </p>
            </section>

            {/* Controls */}
            <div className="mb-8 grid gap-3 md:grid-cols-3">
                <form className="md:col-span-2">
                    <input
                        name="q"
                        defaultValue={rawQ}
                        placeholder="Search systems, templates, kits…"
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input type="hidden" name="cat" value={cat} />
                </form>

                <form>
                    <select
                        name="cat"
                        defaultValue={cat}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {toLabel(c)}
                            </option>
                        ))}
                    </select>

                    <div className="mt-2 flex gap-2">
                        <button
                            type="submit"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/40"
                        >
                            Apply
                        </button>
                        <Link
                            href="/library"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold text-center hover:bg-muted/40"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>

            {/* Meta */}
            <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{totalShown}</span> item(s)
                    {cat !== "all" ? (
                        <>
                            {" "}
                            in <span className="font-semibold text-foreground">{toLabel(cat)}</span>
                        </>
                    ) : null}
                    {q ? (
                        <>
                            {" "}
                            for <span className="font-semibold text-foreground">“{rawQ}”</span>
                        </>
                    ) : null}
                </p>

                <Link href="/manage" className="text-sm underline text-muted-foreground hover:text-foreground">
                    Manage subscription
                </Link>
            </div>

            {/* Empty */}
            {systems.length === 0 && products.length === 0 ? (
                <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
                    <h2 className="text-xl font-bold">No results</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try a different keyword or reset filters.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/library"
                            className="inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95"
                        >
                            Reset
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* SYSTEMS SECTION */}
                    <section className="mb-12">
                        <div className="flex items-end justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-2xl font-extrabold">Systems</h2>
                                <p className="text-sm text-muted-foreground">
                                    Step-by-step blueprints to build real outcomes.
                                </p>
                            </div>
                            <span className="text-xs rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                                {systems.length} system(s)
                            </span>
                        </div>

                        {systems.length === 0 ? (
                            <div className="rounded-3xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                                No systems found for your filters.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {systems.map((s) => {
                                    const tier = (s.tier || "pro") as "free" | "pro";
                                    const newBadge = isNew(s.createdAt);

                                    return (
                                        <div
                                            key={s.id}
                                            className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-extrabold text-lg leading-snug truncate">
                                                        {s.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                        {s.description || "Monetization system"}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span
                                                        className={[
                                                            "text-[11px] px-2 py-1 rounded-full border",
                                                            tier === "pro"
                                                                ? "border-primary/30 bg-primary/10 text-primary"
                                                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                                                        ].join(" ")}
                                                    >
                                                        {tier.toUpperCase()}
                                                    </span>

                                                    {newBadge ? (
                                                        <span className="text-[11px] px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600">
                                                            NEW
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="text-xs rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                                                    {toLabel(s.category || "general")}
                                                </span>
                                                <DifficultyPill v={s.difficulty} />
                                                {s.timeToLaunch ? (
                                                    <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                                        ⏱ {s.timeToLaunch}
                                                    </span>
                                                ) : null}
                                                {s.revenuePotential ? (
                                                    <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                                        💰 {s.revenuePotential}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="mt-6">
                                                {/* دابا غادي نربطوها بصفحة system من بعد */}
                                                <Link
                                                    href={`/systems/${encodeURIComponent(s.id)}`}
                                                    className="block w-full rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white hover:opacity-95"
                                                >
                                                    Open system
                                                </Link>
                                            </div>

                                            <p className="mt-3 text-[11px] text-muted-foreground">
                                                Includes roadmap + assets + execution steps
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* PRODUCTS SECTION */}
                    <section>
                        <div className="flex items-end justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-2xl font-extrabold">Products</h2>
                                <p className="text-sm text-muted-foreground">
                                    Ready-to-use assets you can download instantly.
                                </p>
                            </div>
                            <span className="text-xs rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                                {products.length} product(s)
                            </span>
                        </div>

                        {products.length === 0 ? (
                            <div className="rounded-3xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                                No products found for your filters.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((p) => {
                                    const tier = (p.tier || "pro") as "free" | "pro";
                                    const newBadge = isNew(p.createdAt);

                                    return (
                                        <div
                                            key={p.id}
                                            className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-extrabold text-lg leading-snug truncate">
                                                        {p.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                        {p.description || "Premium resource"}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span
                                                        className={[
                                                            "text-[11px] px-2 py-1 rounded-full border",
                                                            tier === "pro"
                                                                ? "border-primary/30 bg-primary/10 text-primary"
                                                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                                                        ].join(" ")}
                                                    >
                                                        {tier.toUpperCase()}
                                                    </span>

                                                    {newBadge ? (
                                                        <span className="text-[11px] px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600">
                                                            NEW
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="text-xs rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                                                    {toLabel(p.category || "general")}
                                                </span>
                                                {!p.fileUrl ? (
                                                    <span className="text-xs rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-600">
                                                        Coming soon
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="mt-6">
                                                {p.fileUrl ? (
                                                    <DownloadButton
                                                        productId={p.id}
                                                        className="w-full rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white hover:opacity-95"
                                                        label="Download"
                                                    />
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="w-full rounded-2xl border border-border bg-muted/20 text-muted-foreground py-3 font-semibold opacity-80 cursor-not-allowed"
                                                    >
                                                        Coming soon
                                                    </button>
                                                )}
                                            </div>

                                            <p className="mt-3 text-[11px] text-muted-foreground">
                                                {p.fileUrl ? "Instant download" : "New drops added regularly"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
import Link from "next/link";
import DownloadButton from "@/components/DownloadButton";
import DownloadLimitBadge from "@/components/DownloadLimitBadge";
import { getSystemBySlug, getSystemViewModel } from "@/lib/jladan/systems";
import { getSessionUid } from "@/lib/auth/session";
import { canAccessSystemAssets } from "@/lib/jladan/systemAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SystemPage({
    params,
}: {
    params: { slug: string };
}) {
    const system = await getSystemBySlug(params.slug);
    const view = getSystemViewModel(system, params.slug);

    if (!view.exists) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold mb-3">System not found</h1>
                <Link href="/systems" className="underline">
                    Back to systems
                </Link>
            </main>
        );
    }

    const uid = await getSessionUid();
    const access = await canAccessSystemAssets(uid);

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d relative">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Header */}
            <section className="mb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href="/systems"
                            className="text-sm underline text-muted-foreground hover:text-foreground"
                        >
                            ← Back to systems
                        </Link>

                        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                            {view.title}
                        </h1>

                        {view.subtitle ? (
                            <p className="mt-2 text-muted-foreground max-w-2xl">
                                {view.subtitle}
                            </p>
                        ) : null}
                    </div>

                    <div className="sm:mt-1 sm:shrink-0">
                        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur px-4 py-3 jl-glow">
                            <div className="text-[11px] text-muted-foreground mb-2">
                                Daily downloads
                            </div>
                            <DownloadLimitBadge />
                        </div>
                    </div>
                </div>

                {view.summary ? (
                    <div className="mt-6 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-glow">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {view.summary}
                        </p>
                    </div>
                ) : null}
            </section>

            {/* Paywall banner */}
            {!access.allowed ? (
                <section className="mb-10">
                    <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs text-primary">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    JLADAN Pro required
                                </div>

                                <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                                    Unlock the full system assets and downloadable resources
                                </h2>

                                <p className="mt-3 text-sm md:text-base text-muted-foreground">
                                    You can preview this system, but downloads and execution assets are available to JLADAN Pro members only.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={`/pricing?from=system&slug=${encodeURIComponent(params.slug)}`}
                                    className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Unlock JLADAN Pro
                                </Link>

                                <Link
                                    href="/library"
                                    className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                                >
                                    View Library
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            {/* Assets */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">Assets</h2>
                    <span className="text-sm text-muted-foreground">
                        {view.assets.length} item(s)
                    </span>
                </div>

                {view.assets.length === 0 ? (
                    <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur p-10 text-center jl-glow">
                        <h3 className="text-lg font-bold">No assets yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            زيد `assets` array فـ Firestore فـ هاد system.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {view.assets.map((asset, idx) => (
                            <div
                                key={`${asset.productId}-${idx}`}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-card jl-glow"
                            >
                                <h3 className="font-extrabold text-lg truncate">{asset.title}</h3>

                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                    {asset.description || "System resource"}
                                </p>

                                <div className="mt-6">
                                    {access.allowed ? (
                                        <DownloadButton
                                            productId={asset.productId}
                                            className="w-full rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white hover:opacity-95"
                                            label="Download"
                                        />
                                    ) : (
                                        <Link
                                            href={`/pricing?from=system&slug=${encodeURIComponent(params.slug)}`}
                                            className="block w-full rounded-2xl border border-border bg-muted/20 px-4 py-2.5 text-center font-semibold text-muted-foreground hover:bg-muted/30"
                                        >
                                            Unlock to download
                                        </Link>
                                    )}
                                </div>

                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    {access.allowed
                                        ? "Downloads are tracked + limited per day"
                                        : "Available for JLADAN Pro members"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";
import DownloadButton from "@/components/DownloadButton";
import { getSessionUid } from "@/lib/auth/session";
import { canAccessProduct } from "@/lib/jladan/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductDoc = {
    title?: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    fileUrl?: string;
    coverImage?: string | null;
    tags?: string[];
    published?: boolean;
    createdAt?: number;
    preview?: string;
    benefits?: string[];
    format?: string;
};

function normalizeCategoryLabel(input?: string) {
    const s = String(input || "").trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function isNew(createdAt?: number) {
    if (!createdAt) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt <= sevenDays;
}

export default async function ProductPage({
    params,
}: {
    params: { id: string };
}) {
    const db = getAdminDb();

    const ref = db.collection("products").doc(params.id);
    const snap = await ref.get();

    if (!snap.exists) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Product not found</h1>
                <Link
                    href="/library"
                    className="underline text-muted-foreground hover:text-foreground"
                >
                    Go to Library
                </Link>
            </main>
        );
    }

    const product = snap.data() as ProductDoc;

    if (product.published === false) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Not available</h1>
                <p className="text-muted-foreground mb-6">
                    This product isn’t published yet.
                </p>
                <Link href="/library" className="underline">
                    Back to Library
                </Link>
            </main>
        );
    }

    const uid = await getSessionUid();
    const access = await canAccessProduct(uid, product);

    const title = product.title || "Product";
    const tier = product.tier === "free" ? "free" : "pro";
    const categoryLabel = normalizeCategoryLabel(product.category);
    const newBadge = isNew(product.createdAt);

    const benefits =
        Array.isArray(product.benefits) && product.benefits.length > 0
            ? product.benefits
            : [
                "Ready-to-use digital asset",
                "Built for fast execution",
                "Designed for creators, marketers, and founders",
            ];

    const previewText =
        product.preview ||
        product.description ||
        "This premium resource is designed to help you move faster with a practical asset you can use immediately.";

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Header */}
            <section className="mb-10">
                <Link
                    href="/library"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    ← Back to Library
                </Link>

                <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_0.8fr] items-start">
                    {/* Left */}
                    <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                            <span
                                className={[
                                    "text-[11px] px-2.5 py-1 rounded-full border",
                                    tier === "pro"
                                        ? "border-primary/30 bg-primary/10 text-primary"
                                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                                ].join(" ")}
                            >
                                {tier.toUpperCase()}
                            </span>

                            {categoryLabel ? (
                                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
                                    {categoryLabel}
                                </span>
                            ) : null}

                            {product.format ? (
                                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
                                    {product.format}
                                </span>
                            ) : null}

                            {newBadge ? (
                                <span className="text-[11px] px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600">
                                    NEW
                                </span>
                            ) : null}
                        </div>

                        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                            {title}
                        </h1>

                        {product.description ? (
                            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-3xl">
                                {product.description}
                            </p>
                        ) : null}

                        {Array.isArray(product.tags) && product.tags.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {product.tags.slice(0, 6).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {/* Right access card */}
                    <div className="w-full rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-glow">
                        <div className="text-sm text-muted-foreground">Access</div>

                        <div className="mt-1 text-2xl font-extrabold">
                            {tier === "pro" ? "JLADAN Pro" : "Free download"}
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {tier === "pro"
                                ? "Unlock this premium resource with JLADAN Pro."
                                : "This resource is available for free download."}
                        </p>

                        <div className="mt-5">
                            {access.allowed ? (
                                <DownloadButton
                                    productId={params.id}
                                    className="w-full rounded-2xl bg-primary px-4 py-3 text-center font-semibold text-white hover:opacity-95"
                                    label="Download now"
                                />
                            ) : access.reason === "auth_required" ? (
                                <Link
                                    href={`/pricing?from=product&id=${encodeURIComponent(params.id)}`}
                                    className="block w-full rounded-2xl bg-primary px-4 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Sign in & unlock
                                </Link>
                            ) : access.reason === "pro_required" ? (
                                <Link
                                    href={`/pricing?from=product&id=${encodeURIComponent(params.id)}`}
                                    className="block w-full rounded-2xl bg-primary px-4 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Subscribe to unlock
                                </Link>
                            ) : access.reason === "file_missing" ? (
                                <div className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                                    File not ready yet
                                </div>
                            ) : (
                                <div className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                                    Not available
                                </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                            <p>✅ Secure tracked downloads</p>
                            <p>✅ Daily limits applied automatically</p>
                            <p>✅ Instant access after unlock</p>
                        </div>

                        {!access.allowed && tier === "pro" ? (
                            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                                <div className="text-sm font-semibold">What you unlock with Pro</div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    This product + premium systems + premium library resources.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Preview / value */}
                <div className="space-y-8">
                    <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-glow">
                        <h2 className="text-2xl font-extrabold">Preview</h2>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {previewText}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                        <h2 className="text-2xl font-extrabold">What’s inside</h2>

                        <div className="mt-5 grid gap-3">
                            {benefits.map((item, idx) => (
                                <div
                                    key={`${item}-${idx}`}
                                    className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground"
                                >
                                    ✅ {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side conversion panel */}
                <div className="space-y-8">
                    {!access.allowed && tier === "pro" ? (
                        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs text-primary">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                Premium resource
                            </div>

                            <h2 className="mt-4 text-2xl font-extrabold">
                                Unlock this product with JLADAN Pro
                            </h2>

                            <p className="mt-3 text-sm text-muted-foreground">
                                Get access to this premium download plus the full JLADAN library, systems,
                                and future premium drops.
                            </p>

                            <div className="mt-5 flex flex-col gap-3">
                                <Link
                                    href={`/pricing?from=product&id=${encodeURIComponent(params.id)}`}
                                    className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Unlock JLADAN Pro — $5/mo
                                </Link>

                                <Link
                                    href="/library"
                                    className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                                >
                                    View Library
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                        <h2 className="text-xl font-extrabold">Good next step</h2>
                        <p className="mt-3 text-sm text-muted-foreground">
                            The fastest way to get value is to combine this product with one of the
                            systems inside JLADAN.
                        </p>

                        <div className="mt-5">
                            <Link
                                href="/systems"
                                className="inline-flex rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                            >
                                Explore Systems
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
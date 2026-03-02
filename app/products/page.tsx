import Link from "next/link";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import DownloadButton from "@/components/DownloadButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Product = {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    fileUrl?: string;
    createdAt?: number;
};

async function getUidFromSessionCookie(): Promise<string | null> {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const sessionCookie = (await cookies()).get(cookieName)?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decoded.uid || null;
    } catch {
        return null;
    }
}

async function isProActive(): Promise<boolean> {
    const uid = await getUidFromSessionCookie();
    if (!uid) return false;

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const status = userDoc.data()?.subscription?.status;
    return status === "active";
}

function TierBadge({ tier }: { tier: "free" | "pro" }) {
    const isPro = tier === "pro";
    return (
        <span
            className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                "border",
                isPro ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/50 text-foreground",
            ].join(" ")}
        >
            {isPro ? "PRO" : "FREE"}
        </span>
    );
}

function CategoryChip({ category }: { category: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
            {category}
        </span>
    );
}

export default async function ProductsPage() {
    const proActive = await isProActive();

    const db = getAdminDb();
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    const products: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const total = products.length;
    const proCount = products.filter((p) => (p.tier || "pro") === "pro").length;
    const freeCount = total - proCount;

    return (
        <main className="max-w-6xl mx-auto px-6 py-16">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10">
                <div className="absolute inset-0 pointer-events-none [background:radial-gradient(600px_circle_at_20%_0%,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(700px_circle_at_90%_30%,hsl(var(--primary)/0.10),transparent_50%)]" />

                <div className="relative flex items-start justify-between gap-6 flex-wrap">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Digital shop • JLADAN
                        </div>

                        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                            🛍️ Products
                        </h1>

                        <p className="mt-3 text-muted-foreground leading-relaxed">
                            Ready-to-download prompts, templates, and kits. Free items are available for everyone,
                            and Pro unlocks the full library.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="text-xs rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
                                Total: <span className="font-semibold text-foreground">{total}</span>
                            </span>
                            <span className="text-xs rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
                                Free: <span className="font-semibold text-foreground">{freeCount}</span>
                            </span>
                            <span className="text-xs rounded-full border border-border bg-muted/40 px-3 py-1 text-muted-foreground">
                                Pro: <span className="font-semibold text-foreground">{proCount}</span>
                            </span>
                        </div>
                    </div>

                    <div className="relative flex items-center gap-3">
                        {!proActive ? (
                            <>
                                <Link
                                    href="/pricing"
                                    className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white shadow-sm hover:opacity-95"
                                >
                                    Upgrade to Pro
                                </Link>
                                <Link
                                    href="/library"
                                    className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/40"
                                >
                                    View Library
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/library"
                                    className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white shadow-sm hover:opacity-95"
                                >
                                    Go to Library
                                </Link>
                                <Link
                                    href="/manage"
                                    className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/40"
                                >
                                    Manage Plan
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => {
                    const tier = (p.tier || "pro") as "free" | "pro";
                    const canDownload = tier === "free" || proActive;

                    return (
                        <div
                            key={p.id}
                            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {/* glow */}
                            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold leading-snug truncate">
                                        {p.title}
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                        {p.description || "Digital product"}
                                    </p>
                                </div>
                                <TierBadge tier={tier} />
                            </div>

                            <div className="relative mt-4 flex flex-wrap items-center gap-2">
                                {p.category ? <CategoryChip category={p.category} /> : null}
                                {tier === "pro" && !proActive ? (
                                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                        🔒 Requires Pro
                                    </span>
                                ) : null}
                            </div>

                            <div className="relative mt-6">
                                {p.fileUrl ? (
                                    canDownload ? (
                                        <DownloadButton
                                            productId={p.id}
                                            className="w-full rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white"
                                            label="Download"
                                        />
                                    ) : (
                                        <Link
                                            href="/pricing"
                                            className="block w-full rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-center font-semibold hover:bg-muted/60"
                                        >
                                            🔒 Locked — Upgrade
                                        </Link>
                                    )
                                ) : (
                                    <button
                                        disabled
                                        className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-center font-semibold text-muted-foreground"
                                    >
                                        Coming soon
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            {!proActive ? (
                <div className="mt-12 rounded-3xl border border-border bg-card p-8 text-center">
                    <h3 className="text-2xl font-bold">Unlock everything with JLADAN Pro 🔥</h3>
                    <p className="mt-2 text-muted-foreground">
                        Access all premium downloads + weekly updates.
                    </p>
                    <div className="mt-5">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-sm hover:opacity-95"
                        >
                            Upgrade to Pro
                        </Link>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
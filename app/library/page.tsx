import { cookies } from "next/headers";
import Link from "next/link";
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

export default async function LibraryPage({
    searchParams,
}: {
    searchParams?: { q?: string; cat?: string };
}) {
    // ✅ keep your auth logic unchanged
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const sessionCookie = cookies().get(cookieName)?.value;

    if (!sessionCookie) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold mb-3">Library 🔒</h1>
                <p className="text-muted-foreground mb-6">
                    Please sign in and subscribe to access the Pro Library.
                </p>
                <Link href="/pricing" className="underline">
                    Go to Pricing
                </Link>
            </main>
        );
    }

    const adminAuth = getAdminAuth();
    let uid: string | null = null;

    try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        uid = decoded.uid;
    } catch {
        uid = null;
    }

    if (!uid) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold mb-3">Library</h1>
                <p className="text-muted-foreground mb-6">
                    Your session is invalid. Please sign in again.
                </p>
                <Link href="/pricing" className="underline">
                    Go to Pricing
                </Link>
            </main>
        );
    }

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const status = userDoc.data()?.subscription?.status;

    if (status !== "active") {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold mb-3">Library 🔒</h1>
                <p className="text-muted-foreground mb-6">
                    You need an active subscription to access this page.
                </p>
                <Link href="/pricing" className="underline">
                    Upgrade to Pro
                </Link>
            </main>
        );
    }

    // ✅ keep Firestore logic
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    let products: Product[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));

    // Filters (server-side)
    const q = (searchParams?.q || "").trim().toLowerCase();
    const cat = (searchParams?.cat || "all").trim().toLowerCase();

    const categories = Array.from(
        new Set(products.map((p) => (p.category || "general").toLowerCase()))
    ).sort();

    if (cat !== "all") {
        products = products.filter(
            (p) => (p.category || "general").toLowerCase() === cat
        );
    }

    if (q) {
        products = products.filter((p) => {
            const hay = `${p.title || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
            return hay.includes(q);
        });
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Header */}
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Pro Library • New drops regularly
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    🔥 JLADAN Library
                </h1>

                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Exclusive prompts, templates & kits — designed for creators, marketers, and founders.
                </p>
            </section>

            {/* Controls */}
            <div className="mb-8 grid gap-3 md:grid-cols-3">
                <form className="md:col-span-2">
                    <input
                        name="q"
                        defaultValue={searchParams?.q || ""}
                        placeholder="Search prompts, templates, marketing kits..."
                        className="w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input type="hidden" name="cat" value={cat} />
                </form>

                <form>
                    <select
                        name="cat"
                        defaultValue={cat}
                        className="w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
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
                            className="w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-muted"
                        >
                            Apply
                        </button>
                        <Link
                            href="/library"
                            className="w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur px-4 py-2 text-sm font-semibold text-center hover:bg-muted"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>

            {/* Meta */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">{products.length}</span>{" "}
                    item(s)
                    {cat !== "all" ? (
                        <>
                            {" "}
                            in <span className="font-semibold text-foreground">{toLabel(cat)}</span>
                        </>
                    ) : null}
                    {q ? (
                        <>
                            {" "}
                            for <span className="font-semibold text-foreground">“{searchParams?.q}”</span>
                        </>
                    ) : null}
                </p>

                <Link
                    href="/manage"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    Manage subscription
                </Link>
            </div>

            {/* Empty */}
            {products.length === 0 ? (
                <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur p-10 text-center jl-glow">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => {
                        const tier = p.tier || "pro";
                        const category = (p.category || "general").toLowerCase();
                        const newBadge = isNew(p.createdAt);

                        return (
                            <div
                                key={p.id}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-card jl-glow"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="font-extrabold text-lg leading-snug truncate">
                                            {p.title}
                                        </h2>
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
                                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                                            ].join(" ")}
                                        >
                                            {tier.toUpperCase()}
                                        </span>

                                        {newBadge ? (
                                            <span className="text-[11px] px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-500">
                                                NEW
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="text-xs rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                                        {toLabel(category)}
                                    </span>
                                    {!p.fileUrl ? (
                                        <span className="text-xs rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-500">
                                            Coming soon
                                        </span>
                                    ) : null}
                                </div>

                                <div className="mt-6">
                                    {p.fileUrl ? (
                                        <DownloadButton
                                            url={p.fileUrl}
                                            className="inline-block w-full text-center rounded-2xl bg-primary text-white py-3 font-semibold hover:opacity-95"
                                        />
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full rounded-2xl border border-border/60 bg-background/40 backdrop-blur text-muted-foreground py-3 font-semibold opacity-80 cursor-not-allowed"
                                            title="This item will be released soon"
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
        </main>
    );
}
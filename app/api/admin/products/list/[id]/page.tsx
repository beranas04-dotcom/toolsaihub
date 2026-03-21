import Link from "next/link";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import DownloadButton from "@/components/DownloadButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductDoc = {
    title?: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    fileUrl?: string; // Drive fileId
    coverImage?: string | null;
    tags?: string[];
    published?: boolean;
    createdAt?: number;
};

async function getUidFromSessionCookie() {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const sessionCookie = cookies().get(cookieName)?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const db = getAdminDb();

    const ref = db.collection("products").doc(params.id);
    const snap = await ref.get();

    if (!snap.exists) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Product not found</h1>
                <Link href="/library" className="underline text-muted-foreground hover:text-foreground">
                    Go to Library
                </Link>
            </main>
        );
    }

    const p = snap.data() as ProductDoc;

    // hide draft products from users
    if (p.published === false) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Not available</h1>
                <p className="text-muted-foreground mb-6">This product isn’t published yet.</p>
                <Link href="/library" className="underline">
                    Back to Library
                </Link>
            </main>
        );
    }

    const title = p.title || "Product";
    const tier = (p.tier === "free" ? "free" : "pro") as "free" | "pro";
    const hasFile = Boolean(p.fileUrl);

    // check user subscription (for Pro gating CTA)
    const uid = await getUidFromSessionCookie();
    let isProActive = false;
    if (uid) {
        const userSnap = await db.collection("users").doc(uid).get();
        isProActive = userSnap.data()?.subscription?.status === "active";
    }

    const canDownload =
        hasFile && (tier === "free" || (tier === "pro" && isProActive));

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            <section className="mb-10">
                <Link
                    href="/library"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    ← Back to Library
                </Link>

                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            {title}
                        </h1>

                        <div className="mt-3 flex flex-wrap gap-2">
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

                            {p.category ? (
                                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
                                    {p.category}
                                </span>
                            ) : null}

                            {Array.isArray(p.tags) && p.tags.length ? (
                                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
                                    {p.tags.slice(0, 3).join(" • ")}
                                </span>
                            ) : null}
                        </div>

                        {p.description ? (
                            <p className="mt-5 max-w-2xl text-muted-foreground">
                                {p.description}
                            </p>
                        ) : null}
                    </div>

                    {/* CTA Card */}
                    <div className="w-full sm:w-[360px] rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-glow">
                        <div className="text-sm text-muted-foreground">Access</div>
                        <div className="mt-1 text-xl font-extrabold">
                            {tier === "pro" ? "JLADAN Pro" : "Free download"}
                        </div>

                        <div className="mt-4">
                            {canDownload ? (
                                <DownloadButton
                                    productId={params.id}
                                    className="w-full rounded-2xl bg-primary px-4 py-3 text-center font-semibold text-white hover:opacity-95"
                                    label="Download"
                                />
                            ) : tier === "pro" ? (
                                <Link
                                    href="/pricing"
                                    className="block w-full rounded-2xl bg-primary px-4 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Subscribe to unlock
                                </Link>
                            ) : (
                                <div className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                                    File not ready yet
                                </div>
                            )}
                        </div>

                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Downloads are tracked + limited per day.
                        </p>

                        {tier === "pro" && !isProActive ? (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Already subscribed? Go to{" "}
                                <Link href="/library" className="underline hover:text-foreground">
                                    Library
                                </Link>
                                .
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>
        </main>
    );
}
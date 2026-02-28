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

export default async function ProductsPage() {
    const proActive = await isProActive();

    const db = getAdminDb();
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    const products: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    return (
        <main className="max-w-6xl mx-auto px-6 py-20">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-4xl font-bold mb-2">🛍️ Products</h1>
                    <p className="text-muted-foreground">
                        Digital products: prompts, templates, kits…
                    </p>
                </div>

                {!proActive ? (
                    <Link
                        href="/pricing"
                        className="rounded-xl bg-primary px-4 py-2 font-semibold text-white"
                    >
                        Upgrade to Pro
                    </Link>
                ) : (
                    <Link
                        href="/library"
                        className="rounded-xl border px-4 py-2 font-semibold"
                    >
                        Go to Library
                    </Link>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
                {products.map((p) => {
                    const tier = p.tier || "pro";
                    const canDownload = tier === "free" || proActive;

                    return (
                        <div key={p.id} className="border rounded-2xl p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-bold text-lg">{p.title}</h2>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full border ${tier === "pro" ? "border-primary" : ""
                                        }`}
                                >
                                    {tier.toUpperCase()}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2">
                                {p.description || "Digital product"}
                            </p>

                            {p.category ? (
                                <p className="text-xs text-muted-foreground mt-3">
                                    Category: <span className="font-medium">{p.category}</span>
                                </p>
                            ) : null}

                            <div className="mt-5">
                                {p.fileUrl ? (
                                    canDownload ? (
                                        <DownloadButton
                                            url={p.fileUrl}
                                            className="w-full text-center bg-primary text-white py-2 rounded-lg"
                                            label="Download"
                                        />
                                    ) : (
                                        <Link
                                            href="/pricing"
                                            className="block w-full text-center bg-muted text-foreground py-2 rounded-lg"
                                        >
                                            🔒 Locked — Upgrade
                                        </Link>
                                    )
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-muted text-muted-foreground py-2 rounded-lg"
                                    >
                                        Coming soon
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
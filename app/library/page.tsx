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
    tier?: "free" | "pro";
    fileUrl?: string;
    createdAt?: number;
};

export default async function LibraryPage() {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const sessionCookie = (await cookies()).get(cookieName)?.value;

    if (!sessionCookie) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Library 🔒</h1>
                <p className="text-muted-foreground mb-6">
                    You need to login and subscribe to access premium content.
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
                <h1 className="text-3xl font-bold mb-4">Library</h1>
                <p className="text-muted-foreground mb-6">Session invalid.</p>
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
                <h1 className="text-3xl font-bold mb-4">Library 🔒</h1>
                <p className="text-muted-foreground mb-6">
                    You need an active subscription to access this page.
                </p>
                <Link href="/pricing" className="underline">
                    Upgrade to Pro
                </Link>
            </main>
        );
    }

    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    const products: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    return (
        <main className="max-w-6xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-bold mb-2">🔥 JLADAN Library</h1>
            <p className="text-muted-foreground mb-10">
                Exclusive AI prompts & templates for Pro users
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p.id} className="border rounded-xl p-6">
                        <h2 className="font-bold text-lg">{p.title}</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {p.description || "Premium resource"}
                        </p>

                        {p.fileUrl ? (
                            <DownloadButton
                                url={p.fileUrl}
                                className="mt-4 inline-block w-full text-center bg-primary text-white py-2 rounded-lg"
                            />
                        ) : (
                            <button
                                disabled
                                className="mt-4 w-full bg-muted text-muted-foreground py-2 rounded-lg"
                            >
                                Coming soon
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
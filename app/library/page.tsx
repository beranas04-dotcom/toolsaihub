import { cookies } from "next/headers";
import Link from "next/link";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // ✅ PRO CONTENT
    return (
        <main className="max-w-6xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-bold mb-6">🔥 JLADAN Library</h1>

            <p className="text-muted-foreground mb-10">
                Exclusive AI prompts & templates for Pro users
            </p>

            <div className="grid md:grid-cols-3 gap-6">

                {/* PRODUCT 1 */}
                <div className="border rounded-xl p-6">
                    <h2 className="font-bold text-lg">50 Viral TikTok Hooks</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Copy-paste hooks to go viral
                    </p>
                    <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg">
                        Download
                    </button>
                </div>

                {/* PRODUCT 2 */}
                <div className="border rounded-xl p-6">
                    <h2 className="font-bold text-lg">100 AI Image Prompts</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Midjourney & Leonardo prompts
                    </p>
                    <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg">
                        Download
                    </button>
                </div>

                {/* PRODUCT 3 */}
                <div className="border rounded-xl p-6">
                    <h2 className="font-bold text-lg">YouTube Automation Kit</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Scripts + ideas + strategy
                    </p>
                    <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg">
                        Download
                    </button>
                </div>

            </div>
        </main>
    );
}
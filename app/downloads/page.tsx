import Link from "next/link";
import { getSessionUid } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DownloadPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const uid = await getSessionUid();

    if (!uid) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl font-extrabold">Login required</h1>

                <p className="mt-4 text-muted-foreground">
                    Please sign in using the same email used during purchase.
                </p>

                <Link
                    href="/login"
                    className="mt-8 inline-flex rounded-2xl bg-primary px-8 py-4 text-white font-semibold"
                >
                    Sign in
                </Link>
            </main>
        );
    }

    const auth = getAuth();
    const db = getAdminDb();

    const user = await auth.getUser(uid);
    const email = user.email?.trim().toLowerCase() || "";

    const purchase = await db
        .collection("purchases")
        .where("email", "==", email)
        .where("product", "==", "ai-cashflow-kit")
        .limit(1)
        .get();

    const hasAccess = !purchase.empty;

    if (!hasAccess) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl font-extrabold">Access denied</h1>

                <p className="mt-4 text-muted-foreground">
                    This account has no purchase for AI Cashflow Launch Kit.
                </p>

                <Link
                    href="/cashflow-kit"
                    className="mt-8 inline-flex rounded-2xl bg-primary px-8 py-4 text-white font-semibold"
                >
                    View product
                </Link>
            </main>
        );
    }

    const isSuccess = searchParams?.order_id;

    return (
        <main className="max-w-5xl mx-auto px-6 py-16">
            {isSuccess && (
                <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-800">
                    ✅ Payment successful — your access is now unlocked.
                </div>
            )}

            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    Your AI Cashflow Launch Kit
                </h1>

                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                    Your purchase has been verified. You can now access your product files below.
                </p>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
                {/* PDF */}
                <div className="border rounded-2xl p-6 bg-card">
                    <h2 className="text-2xl font-bold">PDF Guide</h2>

                    <p className="mt-3 text-muted-foreground">
                        Download the full AI Cashflow Launch Kit PDF instantly.
                    </p>

                    <a
                        href="/api/download?productId=ai-cashflow-kit"
                        className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Download PDF
                    </a>
                </div>

                {/* NOTION */}
                <div className="border rounded-2xl p-6 bg-card">
                    <h2 className="text-2xl font-bold">Notion Workspace</h2>

                    <p className="mt-3 text-muted-foreground">
                        Coming soon — a companion Notion workspace to help you organize your AI business system.
                    </p>

                    <div className="mt-6 inline-block rounded-xl border border-border px-6 py-3 text-sm font-medium">
                        Coming Soon
                    </div>
                </div>
            </div>

            <div className="mt-10 rounded-2xl border p-6 bg-muted/30">
                <h3 className="text-xl font-bold">Need help?</h3>

                <p className="mt-3 text-muted-foreground">
                    If you completed your payment but cannot access the product, make sure you are signed in with the same email used during checkout.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href="/cashflow-kit"
                        className="inline-flex rounded-xl border border-border px-5 py-3 font-medium hover:bg-muted/40"
                    >
                        Back to product page
                    </Link>

                    <Link
                        href="/contact"
                        className="inline-flex rounded-xl bg-primary px-5 py-3 font-medium text-white"
                    >
                        Contact support
                    </Link>
                </div>
            </div>
        </main>
    );
}
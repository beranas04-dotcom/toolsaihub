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

    // ❌ NOT LOGGED IN
    if (!uid) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl font-extrabold">Login required</h1>

                <p className="mt-4 text-muted-foreground">
                    Please login using the email used during purchase.
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

    // 🔐 CHECK PURCHASE
    const purchase = await db
        .collection("purchases")
        .where("email", "==", email)
        .where("product", "==", "ai-cashflow-kit")
        .limit(1)
        .get();

    const hasAccess = !purchase.empty;

    // ❌ NO ACCESS
    if (!hasAccess) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">

                <h1 className="text-4xl font-extrabold">
                    Access denied
                </h1>

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

    // ✅ SUCCESS MESSAGE (إلى جا من checkout)
    const isSuccess = searchParams?.order_id;

    return (
        <main className="max-w-5xl mx-auto px-6 py-16 text-center">

            {isSuccess && (
                <div className="mb-8 rounded-xl bg-green-100 text-green-800 px-6 py-4">
                    ✅ Payment successful — your access is now unlocked.
                </div>
            )}

            <h1 className="text-5xl font-extrabold">
                Your AI Cashflow Launch Kit
            </h1>

            <p className="mt-4 text-muted-foreground">
                Your purchase has been verified.
            </p>

            <div className="mt-10 grid md:grid-cols-2 gap-6">

                {/* PDF */}
                <div className="border rounded-2xl p-6">
                    <h2 className="text-2xl font-bold">PDF Guide</h2>

                    <a
                        href="/api/download?productId=ai-cashflow-kit"
                        className="mt-4 inline-block bg-primary text-white px-6 py-3 rounded-xl"
                    >
                        Download PDF
                    </a>
                </div>

                {/* NOTION */}
                <div className="border rounded-2xl p-6">
                    <h2 className="text-2xl font-bold">Notion Workspace</h2>

                    <a
                        href="NOTION_LINK"
                        target="_blank"
                        className="mt-4 inline-block bg-primary text-white px-6 py-3 rounded-xl"
                    >
                        Open Notion
                    </a>
                </div>

            </div>

        </main>
    );
}
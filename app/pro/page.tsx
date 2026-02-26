import { cookies } from "next/headers";
import Link from "next/link";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProPage() {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const sessionCookie = (await cookies()).get(cookieName)?.value;

    if (!sessionCookie) {
        return (
            <main className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-3xl font-bold mb-2">Pro</h1>
                <p className="text-muted-foreground mb-6">
                    Please sign in & subscribe to access Pro.
                </p>
                <Link className="underline" href="/pricing">
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
            <main className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-3xl font-bold mb-2">Pro</h1>
                <p className="text-muted-foreground mb-6">Session invalid.</p>
                <Link className="underline" href="/pricing">
                    Go to Pricing
                </Link>
            </main>
        );
    }

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const data = userDoc.data() || {};

    // ✅ support both shapes:
    // - subscription.status (recommended)
    // - plan/status (fallback)
    const status =
        data?.subscription?.status ||
        (data?.plan === "pro" ? "active" : data?.status);

    if (status !== "active") {
        return (
            <main className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-3xl font-bold mb-2">Pro</h1>
                <p className="text-muted-foreground mb-6">
                    Your subscription is not active yet.
                </p>
                <Link className="underline" href="/pricing">
                    Back to Pricing
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-bold mb-2">Welcome to JLADAN Pro ✅</h1>
            <p className="text-muted-foreground">AI Premium Hub</p>
        </main>
    );
}
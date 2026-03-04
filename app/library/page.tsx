import { cookies } from "next/headers";
import Link from "next/link";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import LibraryUI from "@/components/LibraryUI";
import type { Product, SystemItem } from "@/types/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LibraryPage({
    searchParams,
}: {
    searchParams?: { q?: string; cat?: string; tab?: string };
}) {
    // ✅ Auth (keep)
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
    const u = userDoc.data() || {};
    const status = u?.subscription?.status || u?.status;

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

    // ✅ Fetch Systems + Products
    const [systemsSnap, productsSnap] = await Promise.all([
        db.collection("systems").orderBy("createdAt", "desc").get(),
        db.collection("products").orderBy("createdAt", "desc").get(),
    ]);

    let systems: SystemItem[] = systemsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));

    let products: Product[] = productsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));

    // ✅ Filters
    const qRaw = (searchParams?.q || "").trim();
    const q = qRaw.toLowerCase();
    const catRaw = (searchParams?.cat || "all").trim();
    const cat = catRaw.toLowerCase();

    const categories = Array.from(
        new Set(
            [...systems, ...products].map((x: any) => (x.category || "general").toLowerCase())
        )
    ).sort();

    if (cat !== "all") {
        systems = systems.filter((s) => (s.category || "general").toLowerCase() === cat);
        products = products.filter((p) => (p.category || "general").toLowerCase() === cat);
    }

    if (q) {
        systems = systems.filter((s) => {
            const hay = `${s.title || ""} ${s.description || ""} ${s.category || ""}`.toLowerCase();
            return hay.includes(q);
        });

        products = products.filter((p) => {
            const hay = `${p.title || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
            return hay.includes(q);
        });
    }

    return (
        <LibraryUI
            systems={systems}
            products={products}
            categories={categories}
            q={q}
            rawQ={qRaw}
            cat={cat}
        />
    );
}
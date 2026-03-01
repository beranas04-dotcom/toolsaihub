// app/api/lemon/start/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Your Lemon "buy" link
const CHECKOUT_URL =
    "https://jladan-ai.lemonsqueezy.com/checkout/buy/576dc162-0f38-46f8-a94e-b12315019fa6";

function getSiteUrl() {
    // Preferred (you set it)
    const publicSite = process.env.NEXT_PUBLIC_SITE_URL;
    if (publicSite) return publicSite.replace(/\/+$/, "");

    // Vercel fallback
    const vercel = process.env.VERCEL_URL;
    if (vercel) return `https://${vercel}`.replace(/\/+$/, "");

    // Local dev fallback
    return "http://localhost:3000";
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!idToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        const uid = decoded.uid;
        const email = (decoded.email || null) as string | null;

        const db = getAdminDb();
        const sessionId = crypto.randomUUID();

        await db.collection("checkoutSessions").doc(sessionId).set({
            uid,
            email,
            provider: "lemon",
            plan: "pro",
            status: "pending",
            createdAt: Date.now(),
        });

        // ✅ Build checkout URL with redirects + tracking
        const siteUrl = getSiteUrl();

        const successUrl = `${siteUrl}/thanks`;
        const cancelUrl = `${siteUrl}/pricing`;

        const url = new URL(CHECKOUT_URL);

        // Many Lemon checkouts accept these params
        url.searchParams.set("success_url", successUrl);
        url.searchParams.set("cancel_url", cancelUrl);

        // Track your internal checkout session (useful later in webhook/analytics)
        url.searchParams.set("checkout_session_id", sessionId);

        return NextResponse.json({ url: url.toString(), sessionId });
    } catch (e: any) {
        console.error("lemon/start error:", e);
        return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
    }
}
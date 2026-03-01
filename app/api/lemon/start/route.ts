// app/api/lemon/start/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHECKOUT_URL =
    "https://jladan-ai.lemonsqueezy.com/checkout/buy/576dc162-0f38-46f8-a94e-b12315019fa6";

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

        // ✅ IMPORTANT: return clean URL (no params)
        return NextResponse.json({ url: CHECKOUT_URL, sessionId });
    } catch (e: any) {
        console.error("lemon/start error:", e);
        return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
    }
}
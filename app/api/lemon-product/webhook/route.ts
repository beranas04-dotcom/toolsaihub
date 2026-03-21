import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeLower(v: unknown) {
    return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function timingSafeEqualHex(a: string, b: string) {
    try {
        const aBuf = Buffer.from(a, "hex");
        const bBuf = Buffer.from(b, "hex");
        if (aBuf.length !== bBuf.length) return false;
        return crypto.timingSafeEqual(aBuf, bBuf);
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const SECRET = process.env.LEMON_WEBHOOK_SECRET;

        if (!SECRET) {
            console.error("Missing LEMON_WEBHOOK_SECRET");
            return NextResponse.json({ error: "Server error" }, { status: 500 });
        }

        const rawBody = await req.text();

        const signature =
            req.headers.get("x-signature") ||
            req.headers.get("X-Signature") ||
            "";

        const hmac = crypto
            .createHmac("sha256", SECRET)
            .update(rawBody, "utf8")
            .digest("hex");

        if (!signature || !timingSafeEqualHex(hmac, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const eventName = event?.meta?.event_name;

        if (eventName !== "order_created") {
            return NextResponse.json({ ok: true, ignored: true });
        }

        const email =
            safeLower(event?.data?.attributes?.user_email) ||
            safeLower(event?.data?.attributes?.customer_email) ||
            safeLower(event?.data?.attributes?.email);

        if (!email) {
            return NextResponse.json({ ok: true, note: "Email not found" });
        }

        const orderId = String(event?.data?.id || "").trim();

        if (!orderId) {
            return NextResponse.json({ ok: true, note: "Order ID missing" });
        }

        const purchaseRef = adminDb.collection("purchases").doc(orderId);

        const existing = await purchaseRef.get();

        if (existing.exists) {
            return NextResponse.json({ ok: true, note: "Already processed" });
        }

        await purchaseRef.set({
            orderId,
            email,
            product: "ai-cashflow-kit",
            source: "lemonsqueezy",
            createdAt: Date.now(),
        });

        console.log("Purchase saved:", email);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("LEMON_WEBHOOK_ERROR:", err?.message || err);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
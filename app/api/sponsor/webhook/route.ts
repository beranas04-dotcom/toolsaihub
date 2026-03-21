import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string, secret: string) {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");
    return digest === signature;
}

export async function POST(req: Request) {
    try {
        const secret = process.env.LEMON_SPONSOR_WEBHOOK_SECRET;

        if (!secret) {
            return NextResponse.json(
                { error: "Missing LEMON_SPONSOR_WEBHOOK_SECRET" },
                { status: 500 }
            );
        }

        const rawBody = await req.text();
        const signature =
            req.headers.get("x-signature") ||
            req.headers.get("X-Signature") ||
            "";

        if (!signature || !verifySignature(rawBody, signature, secret)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody || "{}");
        const eventName = String(payload?.meta?.event_name || "");

        const custom =
            payload?.meta?.custom_data ||
            payload?.data?.attributes?.custom_data ||
            payload?.data?.attributes?.first_order_item?.custom_data ||
            {};

        const sponsorshipRequestId = String(custom?.sponsorshipRequestId || "").trim();

        if (!sponsorshipRequestId) {
            return NextResponse.json({ ok: true, skipped: true });
        }

        const db = getAdminDb();
        const ref = db.collection("sponsorship_requests").doc(sponsorshipRequestId);

        if (
            eventName === "order_created" ||
            eventName === "subscription_created" ||
            eventName === "subscription_payment_success"
        ) {
            await ref.set(
                {
                    status: "paid",
                    lemonEvent: eventName,
                    updatedAt: Date.now(),
                    paidAt: Date.now(),
                    webhookPayload: {
                        event_name: eventName,
                    },
                },
                { merge: true }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("SPONSOR_WEBHOOK_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNING_SECRET = process.env.LEMON_WEBHOOK_SECRET!;

function safeLower(s: any) {
    return typeof s === "string" ? s.trim().toLowerCase() : "";
}

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = headers().get("x-signature") || "";

        // ✅ verify signature (sha256 hex)
        const hmac = crypto
            .createHmac("sha256", SIGNING_SECRET)
            .update(body, "utf8")
            .digest("hex");

        if (!signature || hmac !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(body);
        const eventName = event?.meta?.event_name || "unknown";

        const email =
            safeLower(event?.data?.attributes?.user_email) ||
            safeLower(event?.data?.attributes?.customer_email) ||
            safeLower(event?.data?.attributes?.email);

        console.log("LEMON EVENT:", eventName, "email:", email || "N/A");

        if (!email) {
            return NextResponse.json({ ok: true, note: "No email in payload" });
        }

        // ✅ find latest checkoutSession for this email (needs index)
        const snap = await adminDb
            .collection("checkoutSessions")
            .where("email", "==", email)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (snap.empty) {
            console.log("No checkoutSessions for email:", email);
            return NextResponse.json({ ok: true, note: "No checkout session match" });
        }

        const sessionDoc = snap.docs[0];
        const session = sessionDoc.data();
        const uid = session?.uid as string | undefined;

        if (!uid) {
            console.log("checkoutSessions missing uid for email:", email);
            return NextResponse.json({ ok: true, note: "Missing uid" });
        }

        // ✅ events
        const activateEvents = new Set([
            "subscription_created",
            "subscription_payment_success",
            "subscription_updated",
            "subscription_resumed",
        ]);

        const deactivateEvents = new Set([
            "subscription_cancelled",
            "subscription_expired",
            "subscription_payment_failed",
            "subscription_paused",
        ]);

        if (activateEvents.has(eventName)) {
            await adminDb.collection("users").doc(uid).set(
                {
                    email,
                    subscription: {
                        provider: "lemon",
                        plan: "pro",
                        status: "active",
                        updatedAt: Date.now(),
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );

            // ✅ mark session paid (clean tracking)
            await sessionDoc.ref.set(
                { status: "paid", paidAt: Date.now(), lastEvent: eventName },
                { merge: true }
            );
        }

        if (deactivateEvents.has(eventName)) {
            await adminDb.collection("users").doc(uid).set(
                {
                    email,
                    subscription: {
                        provider: "lemon",
                        plan: "pro",
                        status: "inactive",
                        updatedAt: Date.now(),
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );

            await sessionDoc.ref.set(
                { status: "inactive", updatedAt: Date.now(), lastEvent: eventName },
                { merge: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("LEMON_WEBHOOK_ERROR:", err?.message || err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
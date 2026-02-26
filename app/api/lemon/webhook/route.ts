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
        const eventName = event?.meta?.event_name;

        // حاول نجيب email من كثر من path باش ما نطيحوش فـ اختلافات
        const email =
            safeLower(event?.data?.attributes?.user_email) ||
            safeLower(event?.data?.attributes?.customer_email) ||
            safeLower(event?.data?.attributes?.email);

        console.log("LEMON EVENT:", eventName, "email:", email || "N/A");

        if (!email) {
            return NextResponse.json({ ok: true, note: "No email in payload" });
        }

        // ✅ نجيبو آخر checkoutSessions لنفس email (باش نلقاو uid)
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

        const session = snap.docs[0].data();
        const uid = session?.uid as string | undefined;

        if (!uid) {
            console.log("checkoutSessions missing uid for email:", email);
            return NextResponse.json({ ok: true, note: "Missing uid" });
        }

        // ✅ أحداث الاشتراك
        if (eventName === "subscription_created" || eventName === "subscription_payment_success") {
            await adminDb.collection("users").doc(uid).set(
                {
                    email,
                    subscription: {
                        provider: "lemon",
                        status: "active",
                        updatedAt: Date.now(),
                        // optional raw info
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );

            // optional: update session status
            await snap.docs[0].ref.set({ status: "paid", paidAt: Date.now() }, { merge: true });
        }

        if (
            eventName === "subscription_cancelled" ||
            eventName === "subscription_expired" ||
            eventName === "subscription_payment_failed"
        ) {
            await adminDb.collection("users").doc(uid).set(
                {
                    email,
                    subscription: {
                        provider: "lemon",
                        status: "inactive",
                        updatedAt: Date.now(),
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("LEMON_WEBHOOK_ERROR:", err?.message || err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
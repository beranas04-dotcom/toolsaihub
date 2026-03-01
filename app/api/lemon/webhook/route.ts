import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeLower(v: unknown) {
    return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function jsonOk(note?: string) {
    return NextResponse.json({ ok: true, ...(note ? { note } : {}) }, { status: 200 });
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

function pickSessionId(event: any): string | null {
    // Try multiple common places (depends on Lemon payload shape)
    const candidates = [
        event?.meta?.custom_data?.checkout_session_id,
        event?.meta?.checkout_session_id,
        event?.data?.attributes?.checkout_session_id,
        event?.data?.attributes?.custom_data?.checkout_session_id,
        event?.data?.attributes?.metadata?.checkout_session_id,
    ];

    for (const c of candidates) {
        if (typeof c === "string" && c.trim()) return c.trim();
    }
    return null;
}

export async function POST(req: Request) {
    try {
        const SIGNING_SECRET = process.env.LEMON_WEBHOOK_SECRET;
        if (!SIGNING_SECRET) {
            console.error("Missing LEMON_WEBHOOK_SECRET");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const rawBody = await req.text();
        const signature = headers().get("x-signature") || headers().get("X-Signature") || "";

        // ✅ Verify signature (sha256 hex)
        const hmac = crypto
            .createHmac("sha256", SIGNING_SECRET)
            .update(rawBody, "utf8")
            .digest("hex");

        if (!signature || !timingSafeEqualHex(hmac, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const eventName = event?.meta?.event_name || "unknown";

        // Email fallback
        const email =
            safeLower(event?.data?.attributes?.user_email) ||
            safeLower(event?.data?.attributes?.customer_email) ||
            safeLower(event?.data?.attributes?.email);

        // Prefer sessionId if available
        const sessionId = pickSessionId(event);

        console.log("LEMON EVENT:", eventName, "email:", email || "N/A", "sessionId:", sessionId || "N/A");

        // 1) Find checkout session
        let uid: string | undefined;
        let sessionRef: FirebaseFirestore.DocumentReference | null = null;

        if (sessionId) {
            const doc = await adminDb.collection("checkoutSessions").doc(sessionId).get();
            if (doc.exists) {
                uid = doc.data()?.uid as string | undefined;
                sessionRef = doc.ref;
            }
        }

        // Fallback to email lookup (MVP)
        if (!uid && email) {
            const snap = await adminDb
                .collection("checkoutSessions")
                .where("email", "==", email)
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();

            if (!snap.empty) {
                const doc = snap.docs[0];
                uid = doc.data()?.uid as string | undefined;
                sessionRef = doc.ref;
            }
        }

        if (!uid) {
            // Still return 200 so Lemon doesn't keep retrying forever (you can inspect logs later)
            return jsonOk("No checkout session match (uid not found)");
        }

        // 2) Decide active/inactive based on eventName
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

        const now = Date.now();

        if (activateEvents.has(eventName)) {
            await adminDb.collection("users").doc(uid).set(
                {
                    email: email || null,
                    subscription: {
                        provider: "lemon",
                        plan: "pro",
                        status: "active",
                        updatedAt: now,
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );

            if (sessionRef) {
                await sessionRef.set({ status: "paid", paidAt: now, lastEvent: eventName }, { merge: true });
            }

            return jsonOk("Activated");
        }

        if (deactivateEvents.has(eventName)) {
            await adminDb.collection("users").doc(uid).set(
                {
                    email: email || null,
                    subscription: {
                        provider: "lemon",
                        plan: "pro",
                        status: "inactive",
                        updatedAt: now,
                        lemonEvent: eventName,
                    },
                },
                { merge: true }
            );

            if (sessionRef) {
                await sessionRef.set({ status: "inactive", updatedAt: now, lastEvent: eventName }, { merge: true });
            }

            return jsonOk("Deactivated");
        }

        // Unknown / ignored event => still 200
        return jsonOk("Ignored event");
    } catch (err: any) {
        console.error("LEMON_WEBHOOK_ERROR:", err?.message || err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
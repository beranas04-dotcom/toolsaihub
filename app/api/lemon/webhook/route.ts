import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

const SIGNING_SECRET = process.env.LEMON_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = headers().get("x-signature");

        // ✅ verify signature
        const hmac = crypto
            .createHmac("sha256", SIGNING_SECRET)
            .update(body)
            .digest("hex");

        if (hmac !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(body);

        console.log("LEMON EVENT:", event.meta.event_name);

        // 🎯 أهم event
        if (event.meta.event_name === "subscription_created") {
            const email = event.data.attributes.user_email;

            if (!email) return NextResponse.json({ ok: true });

            // ✅ خزن user ف Firestore
            await adminDb.collection("users").doc(email).set(
                {
                    email,
                    plan: "pro",
                    status: "active",
                    updatedAt: new Date(),
                },
                { merge: true }
            );
        }

        if (event.meta.event_name === "subscription_cancelled") {
            const email = event.data.attributes.user_email;

            await adminDb.collection("users").doc(email).set(
                {
                    plan: "free",
                    status: "cancelled",
                    updatedAt: new Date(),
                },
                { merge: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
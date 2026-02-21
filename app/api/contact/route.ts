import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin"; // create this file below if you don't have it
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";

type Body = {
    name: string;
    email: string;
    subject?: string;
    message: string;
    website?: string; // honeypot
};

function getIP() {
    const h = headers();
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Optional: Resend email notification
async function maybeSendEmail(payload: Body, ip: string, messageId: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    console.log("RESEND_ENV:", {
        apiKey: !!apiKey,
        to,
        from,
    });

    if (!apiKey || !to || !from) {
        console.log("RESEND_SKIPPED: missing env");
        return;
    }

    const resend = new Resend(apiKey);
    const subjectSafe = (payload.subject || "New message").slice(0, 120);

    await resend.emails.send({
        from,
        to,
        subject: `[AIToolsHub Contact] ${subjectSafe} — ${payload.name}`,
        replyTo: payload.email,
        text:
            `New contact message\n\n` +
            `Message ID: ${messageId}\n` +
            `Name: ${payload.name}\n` +
            `Email: ${payload.email}\n` +
            `IP: ${ip}\n` +
            `Subject: ${payload.subject || "-"}\n\n` +
            `Message:\n${payload.message}\n`,
    });

    console.log("EMAIL_SENT_SUCCESS");
}


export async function POST(req: Request) {
    try {
        const ip = getIP();
        const body = (await req.json()) as Body;

        // Honeypot: if filled => silently accept (avoid giving signal to bots)
        if (body.website && body.website.trim().length > 0) {
            return NextResponse.json({ ok: true });
        }

        const name = (body.name || "").trim();
        const email = (body.email || "").trim();
        const subject = (body.subject || "").trim();
        const message = (body.message || "").trim();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }
        if (message.length > 5000) {
            return NextResponse.json({ error: "Message is too long." }, { status: 400 });
        }

        // Server-side rate limit: max 5 messages / 24h per IP
        const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const rateRef = adminDb.collection("contact_rate").doc(`${ip}_${dayKey}`);

        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(rateRef);
            const count = snap.exists ? (snap.data()?.count || 0) : 0;
            if (count >= 5) {
                throw new Error("RATE_LIMIT");
            }
            tx.set(
                rateRef,
                {
                    ip,
                    dayKey,
                    count: count + 1,
                    updatedAt: FieldValue.serverTimestamp(),
                    createdAt: snap.exists ? snap.data()?.createdAt : FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        });

        // Save message to Firestore
        const doc = await adminDb.collection("contact_messages").add({
            name,
            email,
            subject: subject || null,
            message,
            ip,
            userAgent: headers().get("user-agent") || null,
            createdAt: FieldValue.serverTimestamp(),
            status: "new",
            source: "contact_form",
        });

        // Optional email notify
        try {
            await maybeSendEmail({ name, email, subject, message }, ip, doc.id);
        } catch (e) {
            console.error("RESEND_ERROR:", e);
        }



        return NextResponse.json({ ok: true, id: doc.id });
    } catch (err: any) {
        if (err?.message === "RATE_LIMIT") {
            return NextResponse.json(
                { error: "Too many messages from your network today. Please try again later." },
                { status: 429 }
            );
        }
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}

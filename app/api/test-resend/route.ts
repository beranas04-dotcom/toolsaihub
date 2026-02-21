import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const to = process.env.CONTACT_TO_EMAIL;
        const from = process.env.CONTACT_FROM_EMAIL;

        if (!apiKey || !to || !from) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Missing env vars",
                    env: {
                        RESEND_API_KEY: !!apiKey,
                        CONTACT_TO_EMAIL: to || null,
                        CONTACT_FROM_EMAIL: from || null,
                    },
                },
                { status: 400 }
            );
        }

        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);

        const r = await resend.emails.send({
            from,
            to,
            subject: "Resend test — AIToolsHub",
            text: "If you received this, Resend is working.",
        });

        return NextResponse.json({ ok: true, result: r });
    } catch (e: any) {
        return NextResponse.json(
            {
                ok: false,
                error: e?.message || "Resend error",
                details: e,
            },
            { status: 500 }
        );
    }
}

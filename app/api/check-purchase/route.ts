import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ hasAccess: false });
        }

        const snap = await adminDb
            .collection("purchases")
            .where("email", "==", email.toLowerCase())
            .where("product", "==", "ai-cashflow-kit")
            .limit(1)
            .get();

        return NextResponse.json({
            hasAccess: !snap.empty,
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ hasAccess: false });
    }
}
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing request id" }, { status: 400 });
        }

        const db = getAdminDb();

        await db.collection("sponsorship_requests").doc(String(id)).set(
            {
                status: "rejected",
                rejectedAt: Date.now(),
                updatedAt: Date.now(),
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("ADMIN_SPONSORSHIPS_REJECT_ERROR:", err);
        return NextResponse.json({ error: "Reject failed" }, { status: 500 });
    }
}
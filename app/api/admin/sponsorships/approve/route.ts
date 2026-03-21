import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { activateToolSponsorship } from "@/lib/sponsorship/activation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing request id" }, { status: 400 });
        }

        const db = getAdminDb();
        const ref = db.collection("sponsorship_requests").doc(String(id));
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const data = snap.data() as any;

        if (!data?.toolId || !data?.plan) {
            return NextResponse.json({ error: "Invalid sponsorship request" }, { status: 400 });
        }

        await activateToolSponsorship(data.toolId, data.plan);

        await ref.set(
            {
                status: "approved",
                approvedAt: Date.now(),
                updatedAt: Date.now(),
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("ADMIN_SPONSORSHIPS_APPROVE_ERROR:", err);
        return NextResponse.json({ error: "Approve failed" }, { status: 500 });
    }
}
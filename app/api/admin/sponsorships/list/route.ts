import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = getAdminDb();

        const snap = await db
            .collection("sponsorship_requests")
            .orderBy("createdAt", "desc")
            .get();

        const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
        }));

        return NextResponse.json({ ok: true, items });
    } catch (err) {
        console.error("ADMIN_SPONSORSHIPS_LIST_ERROR:", err);
        return NextResponse.json(
            { error: "Failed to load sponsorship requests" },
            { status: 500 }
        );
    }
}
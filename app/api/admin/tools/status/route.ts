import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // ✅ hard gate (cookie session + ADMIN_EMAILS)
        await requireAdminUser();

        const body = await req.json().catch(() => ({}));

        const id = String(body?.id || "").trim();
        const status = String(body?.status || "").trim();

        if (!id) {
            return NextResponse.json({ error: "Missing tool id" }, { status: 400 });
        }

        if (!["pending", "published", "rejected", "draft"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const db = getAdminDb();

        await db.collection("tools").doc(id).set(
            {
                status,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = String(e?.message || "");
        if (msg === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "Not signed in" }, { status: 401 });
        }
        if (msg === "FORBIDDEN") {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }

        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

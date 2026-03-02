import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dayKeyUTC(ts = Date.now()) {
    const d = new Date(ts);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

export async function GET() {
    try {
        // 1) session
        const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
        const sessionCookie = cookies().get(cookieName)?.value;

        if (!sessionCookie) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decoded?.uid;
        if (!uid) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const db = getAdminDb();

        // 2) pro?
        const userSnap = await db.collection("users").doc(uid).get();
        const isProActive = userSnap.data()?.subscription?.status === "active";

        const PRO_LIMIT = Number(process.env.PRO_DOWNLOADS_PER_DAY || 50);
        const FREE_LIMIT = Number(process.env.FREE_DOWNLOADS_PER_DAY || 10);
        const limit = isProActive ? PRO_LIMIT : FREE_LIMIT;

        // 3) read today usage
        const day = dayKeyUTC();
        const rlDocId = `${uid}_${day}`;
        const rlSnap = await db.collection("rate_limits").doc(rlDocId).get();
        const used = rlSnap.exists ? Number((rlSnap.data() as any)?.count || 0) : 0;

        const remaining = Math.max(limit - used, 0);

        return NextResponse.json(
            { ok: true, day, limit, used, remaining, isProActive },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
    }
}
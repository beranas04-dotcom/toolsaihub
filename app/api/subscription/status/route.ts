import { NextResponse } from "next/server";
import { getAdminAuth, adminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    try {
        // ✅ MUST match the cookie created in /api/user/session
        const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
        const sessionCookie = cookies().get(cookieName)?.value;

        if (!sessionCookie) {
            return NextResponse.json({ ok: false, status: "none" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();

        // checkRevoked=true ✅ (security) — keep it
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

        const uid = decoded?.uid;
        if (!uid) {
            return NextResponse.json({ ok: false, status: "none" }, { status: 401 });
        }

        const snap = await adminDb.collection("users").doc(uid).get();
        const status = snap.exists ? snap.data()?.subscription?.status || "none" : "none";

        return NextResponse.json({ ok: true, status }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ ok: false, status: "none" }, { status: 401 });
    }
}
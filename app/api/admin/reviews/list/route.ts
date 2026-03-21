import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || "__user_session";
const ADMIN_COOKIE_FALLBACK = "aitoolshub_token";

function isAdminEmail(email?: string | null) {
    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (!email) return false;
    return list.includes(email.toLowerCase());
}

async function getUidFromAnySessionCookie() {
    const jar = cookies();
    const token =
        jar.get(USER_COOKIE_NAME)?.value ||
        jar.get(ADMIN_COOKIE_FALLBACK)?.value;

    if (!token) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(token, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const uid = await getUidFromAnySessionCookie();
        if (!uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();
        const user = await adminAuth.getUser(uid);

        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const db = getAdminDb();
        const snap = await db
            .collection("reviews")
            .orderBy("createdAt", "desc")
            .limit(300)
            .get();

        const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
        }));

        return NextResponse.json({ ok: true, items });
    } catch (err) {
        console.error("ADMIN_REVIEWS_LIST_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "aitoolshub_token";

function isAdminEmail(email?: string | null) {
    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    if (!email) return false;
    return list.includes(email.toLowerCase());
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const idToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : "";

        if (!idToken) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();

        // Verify Google/Firebase ID token
        const decoded = await adminAuth.verifyIdToken(idToken, true);
        const user = await adminAuth.getUser(decoded.uid);

        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Admin access denied" }, { status: 403 });
        }

        const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const res = NextResponse.json({ ok: true });

        res.cookies.set({
            name: ADMIN_COOKIE_NAME,
            value: sessionCookie,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: Math.floor(expiresIn / 1000),
        });

        return res;
    } catch (err) {
        console.error("ADMIN_SESSION_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
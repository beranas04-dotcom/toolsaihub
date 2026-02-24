// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "aitoolshub_token";
const EXPIRES_IN = 1000 * 60 * 60 * 24 * 7; // 7 days in ms

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as { token?: string };
        const idToken = body?.token;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();

        // ✅ Verify ID token first (ensures it's real)
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        // ✅ Create secure session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN,
        });

        cookies().set(COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN / 1000, // seconds
        });

        return NextResponse.json({
            ok: true,
            uid: decoded.uid,
            isAdmin: (decoded as any).admin === true,
        });
    } catch (e: any) {
        console.error("SESSION_ERROR:", e?.message, e);
        return NextResponse.json(
            { error: "Invalid token", details: e?.message || "unknown" },
            { status: 401 }
        );
    }
}

export async function DELETE() {
    cookies().set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return NextResponse.json({ ok: true });
}
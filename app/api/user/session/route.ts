// app/api/user/session/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;

    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();

    // verify idToken
    await adminAuth.verifyIdToken(token, true);

    const days = Number(process.env.USER_COOKIE_DAYS || 14);
    const expiresInMs = days * 24 * 60 * 60 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(token, {
        expiresIn: expiresInMs,
    });

    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";

    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(expiresInMs / 1000),
    });

    return res;
}

export async function DELETE() {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
    return res;
}
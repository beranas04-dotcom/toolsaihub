import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
    const cookieName = process.env.USER_COOKIE_NAME || "__user_session";

    const res = NextResponse.json({ ok: true });
    // مسح الكوكي نهائيا
    res.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return res;
}
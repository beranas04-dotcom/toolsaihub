import { NextResponse } from "next/server";

export async function POST() {
    const COOKIE_NAME = process.env.USER_COOKIE_NAME || "aitoolshub_token";

    const res = NextResponse.json({ ok: true });

    res.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });

    return res;
}
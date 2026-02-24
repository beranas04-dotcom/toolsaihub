import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cookie_test", "1", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
    });
    return res;
}
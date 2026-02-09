import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!email) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("aitoolshub_admin_email", email, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
    return res;
}

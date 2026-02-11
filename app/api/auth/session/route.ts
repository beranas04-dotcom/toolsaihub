import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "aitoolshub_token";

export async function POST(req: Request) {
    const { token } = (await req.json().catch(() => ({}))) as { token?: string };

    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    cookies().set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ ok: true });
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

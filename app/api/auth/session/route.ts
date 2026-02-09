import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { token } = await req.json().catch(() => ({}));

    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    cookies().set("firebase_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
    });

    return NextResponse.json({ ok: true });
}

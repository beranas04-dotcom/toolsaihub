// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "aitoolshub_token";
const EXPIRES_IN = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as { token?: string };
        const idToken = body?.token;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();

        // 1) verify idToken
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        // 2) OPTIONAL HARD BLOCK: allow only your admin emails to create session
        const email = (decoded as any).email?.toLowerCase();
        const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
        const admins = raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

        if (!email || !admins.includes(email)) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }

        // 3) create session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN,
        });

        const cookieStore = cookies();
        cookieStore.set(COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: true,          // ✅ forced true on Vercel (https)
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN / 1000,
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("SESSION_ERROR:", e?.message, e);
        return NextResponse.json(
            { error: "Invalid token", details: e?.message || "unknown" },
            { status: 401 }
        );
    }
}

export async function DELETE() {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return NextResponse.json({ ok: true });
}
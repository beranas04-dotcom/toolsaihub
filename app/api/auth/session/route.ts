// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "aitoolshub_token";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days (seconds)

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as { token?: string };
        const idToken = body?.token;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();

        // 1) verify
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        // 2) allow only admin emails (security)
        const email = (decoded as any).email?.toLowerCase();
        const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
        const admins = raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

        if (!email || !admins.includes(email)) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }

        // 3) create session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN * 1000,
        });

        // ✅ IMPORTANT: set cookie on the Response object
        const res = NextResponse.json({ ok: true });
        res.cookies.set(COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: true, // vercel is https
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN,
        });

        return res;
    } catch (e: any) {
        console.error("SESSION_ERROR:", e?.message, e);
        return NextResponse.json(
            { error: "Invalid token", details: e?.message || "unknown" },
            { status: 401 }
        );
    }
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    return res;
}
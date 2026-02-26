import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "aitoolshub_token";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

function getAdminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as { token?: string };
        const idToken = body?.token;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        const email = (decoded?.email || "").toLowerCase();
        const admins = getAdminEmails();

        if (!email || (admins.length > 0 && !admins.includes(email))) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN * 1000,
        });

        const res = NextResponse.json({ ok: true });

        res.cookies.set(COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ مهم
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN,
        });

        // helpful header (debug)
        res.headers.set("x-set-cookie", "1");
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    return res;
}
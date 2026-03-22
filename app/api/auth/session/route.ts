import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || "__user_session";
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "aitoolshub_token";
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
        const body = (await req.json().catch(() => ({}))) as {
            token?: string;
            idToken?: string;
        };

        const idToken = body?.token || body?.idToken;

        if (!idToken || typeof idToken !== "string") {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(idToken, true);

        const email = (decoded?.email || "").toLowerCase();
        const admins = getAdminEmails();
        const isAdminUser = !!email && admins.includes(email);

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN * 1000,
        });

        const res = NextResponse.json({
            ok: true,
            isAdmin: isAdminUser,
        });

        // ✅ Main cookie for all authenticated users
        res.cookies.set(USER_COOKIE_NAME, sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN,
        });

        // ✅ Admin cookie only for admins (keeps /admin middleware working)
        if (isAdminUser) {
            res.cookies.set(ADMIN_COOKIE_NAME, sessionCookie, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: EXPIRES_IN,
            });
        } else {
            // clear admin cookie if non-admin
            res.cookies.set(ADMIN_COOKIE_NAME, "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });
        }

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

    res.cookies.set(USER_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    res.cookies.set(ADMIN_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return res;
}
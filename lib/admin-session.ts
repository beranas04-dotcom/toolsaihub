import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

const COOKIE_NAME = "aitoolshub_token"; // ✅ نفس الاسم اللي كتستعمل ف /api/auth/session

type SessionUser = {
    uid: string;
    email: string | null;
    isAdmin: boolean;
};

function getAdminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export async function getServerSessionUser(): Promise<SessionUser | null> {
    try {
        const sessionCookie = cookies().get(COOKIE_NAME)?.value;
        if (!sessionCookie) return null;

        const adminAuth = getAdminAuth();

        // ✅ verify SESSION cookie (ماشي idToken)
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

        const email = (decoded.email || null) as string | null;

        // ✅ admin by custom claim OR by ADMIN_EMAILS
        const admins = getAdminEmails();
        const isAdmin =
            (decoded as any).admin === true ||
            (email ? admins.includes(email.toLowerCase()) : false);

        return {
            uid: decoded.uid,
            email,
            isAdmin,
        };
    } catch {
        return null;
    }
}
import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "aitoolshub_token";

export type SessionUser = {
    uid: string;
    email: string | null;
    isAdmin: boolean;
};

export type AdminUser = {
    uid: string;
    email?: string;
};

function getAdminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

function isEmailAdmin(email: string | null): boolean {
    if (!email) return false;
    const admins = getAdminEmails();
    if (admins.length === 0) return false;
    return admins.includes(email.toLowerCase());
}

/**
 * تستعملها فـ routes/admin باش تفرض admin access.
 * كتتحقق من cookie: aitoolshub_token
 */
export async function requireAdminUser(): Promise<AdminUser> {
    const session = (await cookies()).get(COOKIE_NAME)?.value;
    if (!session) throw new Error("UNAUTHORIZED_ADMIN");

    // IMPORTANT: حنا كنفضلو Session Cookie
    let decoded: any;
    try {
        decoded = await adminAuth.verifySessionCookie(session, true);
    } catch {
        // fallback إذا كنت كتخزن idToken بدل session cookie (غير احتياط)
        try {
            decoded = await adminAuth.verifyIdToken(session);
        } catch {
            throw new Error("UNAUTHORIZED_ADMIN");
        }
    }

    const email = (decoded?.email || null) as string | null;

    // admin via custom claim OR via ADMIN_EMAILS
    const isAdmin = decoded?.admin === true || isEmailAdmin(email);
    if (!isAdmin) throw new Error("FORBIDDEN_ADMIN");

    return { uid: decoded.uid, email: decoded.email };
}

/**
 * كتستعملها فـ server components/pages باش تعرف شكون داخل
 */
export async function getServerSessionUser(): Promise<SessionUser | null> {
    try {
        const sessionCookie = (await cookies()).get(COOKIE_NAME)?.value;
        if (!sessionCookie) return null;

        const decoded: any = await adminAuth.verifySessionCookie(sessionCookie, true);
        const email = (decoded?.email || null) as string | null;

        const isAdmin = decoded?.admin === true || isEmailAdmin(email);

        return {
            uid: decoded.uid,
            email,
            isAdmin,
        };
    } catch {
        return null;
    }
}

export function getAdminCookieName() {
    return COOKIE_NAME;
}
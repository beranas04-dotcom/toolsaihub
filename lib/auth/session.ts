import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || "__user_session";
const ADMIN_COOKIE_FALLBACK = "aitoolshub_token";

export async function getSessionUid(): Promise<string | null> {
    const jar = cookies();

    const token =
        jar.get(USER_COOKIE_NAME)?.value ||
        jar.get(ADMIN_COOKIE_FALLBACK)?.value;

    if (!token) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(token, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

export async function getCurrentUserEmail(): Promise<string | null> {
    const uid = await getSessionUid();
    if (!uid) return null;

    try {
        const adminAuth = getAdminAuth();
        const user = await adminAuth.getUser(uid);
        return user.email || null;
    } catch {
        return null;
    }
}

export async function getCurrentUserSession() {
    const uid = await getSessionUid();
    const email = uid ? await getCurrentUserEmail() : null;

    return {
        uid,
        email,
        authenticated: Boolean(uid),
    };
}
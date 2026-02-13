import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

function getAdminEmailAllowlist() {
    return (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

export type ServerSessionUser = {
    uid: string;
    email: string;
    isAdmin: boolean;
};

export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
    const token =
        cookies().get("aitoolshub_token")?.value || cookies().get("__session")?.value;

    if (!token) return null;

    try {
        const decoded = await getAdminAuth().verifyIdToken(token);
        const email = String(decoded.email || "").toLowerCase();
        if (!email) return null;

        const allowlist = getAdminEmailAllowlist();

        return {
            uid: decoded.uid,
            email,
            isAdmin: allowlist.includes(email),
        };
    } catch {
        return null;
    }
}

export async function requireAdminUser(): Promise<ServerSessionUser> {
    const user = await getServerSessionUser();
    if (!user) throw new Error("UNAUTHENTICATED");
    if (!user.isAdmin) throw new Error("FORBIDDEN");
    return user;
}

// lib/adminAuth.ts
import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

const COOKIE_NAME = "aitoolshub_token";

export type ServerUser = {
    uid: string;
    email?: string;
    isAdmin: boolean;
    claims?: Record<string, any>;
};

export async function getServerSessionUser(req?: Request): Promise<ServerUser | null> {
    const adminAuth = getAdminAuth();

    // A) Session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME)?.value;

    if (session) {
        try {
            const decoded = await adminAuth.verifySessionCookie(session, true);
            return {
                uid: decoded.uid,
                email: (decoded as any).email,
                isAdmin: (decoded as any).admin === true,
                claims: decoded as any,
            };
        } catch {
            // fallthrough
        }
    }

    // B) Bearer token (باش ما نكسروش API اللي باقين كيعتمدو عليه)
    if (req) {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (token) {
            try {
                const decoded = await adminAuth.verifyIdToken(token, true);
                return {
                    uid: decoded.uid,
                    email: (decoded as any).email,
                    isAdmin: (decoded as any).admin === true,
                    claims: decoded as any,
                };
            } catch {
                return null;
            }
        }
    }

    return null;
}

export async function requireAdmin(req?: Request): Promise<ServerUser> {
    const user = await getServerSessionUser(req);
    if (!user || !user.isAdmin) throw new Error("UNAUTHORIZED");
    return user;
}
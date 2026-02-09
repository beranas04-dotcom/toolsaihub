import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(/[,;\n ]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export async function getServerSessionUser(): Promise<
    { email: string; isAdmin: boolean } | null
> {
    const token = cookies().get("firebase_token")?.value;

    if (!token) return null;

    try {
        const decoded = await getAdminAuth().verifyIdToken(token);

        const email = decoded.email?.toLowerCase();
        if (!email) return null;

        return {
            email,
            isAdmin: ADMIN_EMAILS.includes(email),
        };
    } catch (err) {
        console.error("Invalid Firebase token", err);
        return null;
    }
}

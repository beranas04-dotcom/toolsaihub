import { cookies } from "next/headers";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/**
 * Minimal server "session" check.
 * In المرحلة الجاية نربطوها ب Firebase Auth / NextAuth.
 * دابا كنستعملو cookie بسيطة فيها email (مؤقتاً).
 */
export async function getServerSessionUser(): Promise<{ email: string; isAdmin: boolean } | null> {
    const store = cookies();
    const email = store.get("aitoolshub_admin_email")?.value?.toLowerCase();

    if (!email) return null;

    return {
        email,
        isAdmin: ADMIN_EMAILS.includes(email),
    };
}

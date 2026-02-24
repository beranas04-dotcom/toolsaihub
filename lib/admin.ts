import type { User } from "@/types";

const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

const ADMIN_EMAILS = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function isAdmin(user: User | null): boolean {
    if (!user?.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export function getAdminEmails(): string[] {
    return ADMIN_EMAILS;
}
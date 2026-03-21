import "server-only";
import { getSubscriptionStatus } from "@/lib/billing/subscription";

export async function canAccessSystemAssets(uid: string | null) {
    if (!uid) {
        return {
            allowed: false,
            reason: "auth_required" as const,
        };
    }

    const subscription = await getSubscriptionStatus(uid);

    const hasAccess =
        subscription?.active === true ||
        subscription?.isAdmin === true;

    if (!hasAccess) {
        return {
            allowed: false,
            reason: "pro_required" as const,
        };
    }

    return {
        allowed: true,
        reason: "pro" as const,
    };
}
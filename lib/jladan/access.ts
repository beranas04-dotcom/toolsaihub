import "server-only";
import { isProUser } from "@/lib/billing/subscription";

export type AccessReason =
    | "free"
    | "pro"
    | "auth_required"
    | "pro_required"
    | "not_found"
    | "file_missing";

export async function canAccessProduct(uid: string | null, product: any) {
    if (!product) {
        return {
            allowed: false,
            reason: "not_found" as AccessReason,
        };
    }

    const tier = product?.tier === "free" ? "free" : "pro";
    const hasFile = Boolean(product?.fileUrl);

    if (!hasFile) {
        return {
            allowed: false,
            reason: "file_missing" as AccessReason,
        };
    }

    if (tier === "free") {
        return {
            allowed: true,
            reason: "free" as AccessReason,
        };
    }

    if (!uid) {
        return {
            allowed: false,
            reason: "auth_required" as AccessReason,
        };
    }

    const pro = await isProUser(uid);

    if (!pro) {
        return {
            allowed: false,
            reason: "pro_required" as AccessReason,
        };
    }

    return {
        allowed: true,
        reason: "pro" as AccessReason,
    };
}
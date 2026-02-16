"use server";

import { getServerSessionUser } from "@/lib/admin-session";
import { approveSubmission, rejectSubmission } from "@/lib/admin-submissions";

export async function approveSubmissionAction(id: string) {
    const user = await getServerSessionUser();
    if (!user) return { ok: false, error: "Unauthorized" as const };
    if (!user.isAdmin) return { ok: false, error: "Forbidden" as const };

    try {
        // ✅ approveSubmission expects an object
        await approveSubmission({
            submissionId: id,
            adminUid: user.uid,
            adminEmail: user.email ?? undefined,
        });
        return { ok: true as const };
    } catch (e: any) {
        return { ok: false as const, error: e?.message || "Server error" };
    }
}

export async function rejectSubmissionAction(id: string, reason?: string) {
    const user = await getServerSessionUser();
    if (!user) return { ok: false, error: "Unauthorized" as const };
    if (!user.isAdmin) return { ok: false, error: "Forbidden" as const };

    try {
        // ✅ rejectSubmission expects (id, reason)
        await rejectSubmission(id, reason);
        return { ok: true as const };
    } catch (e: any) {
        return { ok: false as const, error: e?.message || "Server error" };
    }
}

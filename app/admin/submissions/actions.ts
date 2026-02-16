// app/admin/submissions/actions.ts
"use server";

import { getServerSessionUser } from "@/lib/admin-session";
import { approveSubmission, rejectSubmission } from "@/lib/admin-submissions";

export async function approveSubmissionAction(id: string) {
    const user = await getServerSessionUser();
    if (!user) return { ok: false as const, error: "Unauthorized" as const };
    if (!user.isAdmin) return { ok: false as const, error: "Forbidden" as const };

    try {
        const result = await approveSubmission({
            submissionId: id,
            adminUid: user.uid,
            adminEmail: user.email,
        }); // ✅ فيه toolId
        return { ok: true as const, toolId: result.toolId };
    } catch (e: any) {
        return { ok: false as const, error: e?.message || "Server error" };
    }
}

export async function rejectSubmissionAction(id: string, reason?: string) {
    const user = await getServerSessionUser();
    if (!user) return { ok: false as const, error: "Unauthorized" as const };
    if (!user.isAdmin) return { ok: false as const, error: "Forbidden" as const };

    try {
        await rejectSubmission({
            submissionId: id,
            reason,
            adminUid: user.uid,
            adminEmail: user.email,
        });
        return { ok: true as const };
    } catch (e: any) {
        return { ok: false as const, error: e?.message || "Server error" };
    }
}

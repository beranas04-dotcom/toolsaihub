import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { approveSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(
    _req: Request,
    ctx: { params: { id: string } }
) {
    try {
        const admin = await requireAdminUser();

        await approveSubmission({
            submissionId: ctx.params.id,
            adminUid: admin.uid,
            adminEmail: admin.email ?? undefined,
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

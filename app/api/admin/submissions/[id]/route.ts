import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { approveSubmission, rejectSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdminUser();
        const body = await req.json().catch(() => ({}));

        const action = String(body?.action || "");
        const reason = String(body?.reason || "");

        if (action === "reject") {
            await rejectSubmission({
                submissionId: params.id,
                adminUid: admin.uid,
                adminEmail: admin.email,
                reason,
            });
            return NextResponse.json({ ok: true });
        }

        await approveSubmission({
            submissionId: params.id,
            adminUid: admin.uid,
            adminEmail: admin.email,
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

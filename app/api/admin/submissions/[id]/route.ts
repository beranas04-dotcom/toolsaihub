import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/admin-session";
import { approveSubmission, rejectSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const admin = await getServerSessionUser();
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const action = body?.action;
        const reason = body?.reason;

        if (action === "approve") {
            // ✅ approve = object
            await approveSubmission({
                submissionId: params.id,
                adminUid: admin.uid,
                adminEmail: admin.email ?? undefined,
            });
        }

        if (action === "reject") {
            // ✅ reject = (id, reason)
            await rejectSubmission(params.id, reason);
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

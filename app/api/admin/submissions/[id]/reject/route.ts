import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-session";
import { rejectSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    ctx: { params: { id: string } }
) {
    try {
        await requireAdminUser();
        const body = (await req.json().catch(() => ({}))) as { reason?: string };

        await rejectSubmission(ctx.params.id, body?.reason);

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

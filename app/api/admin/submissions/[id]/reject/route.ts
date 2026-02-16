// app/api/admin/submissions/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/admin-session";
import { rejectSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
    const user = await getServerSessionUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (!user.isAdmin) return new NextResponse("Forbidden", { status: 403 });

    try {
        const body = await req.json().catch(() => ({}));
        const reason = typeof body?.reason === "string" ? body.reason : undefined;

        await rejectSubmission(ctx.params.id, reason);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e?.message || "Server error", { status: 500 });
    }
}

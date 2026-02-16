// app/api/admin/submissions/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/admin-session";
import { approveSubmission } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: { id: string } }) {
    const user = await getServerSessionUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (!user.isAdmin) return new NextResponse("Forbidden", { status: 403 });

    try {
        await approveSubmission(ctx.params.id);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return new NextResponse(e?.message || "Server error", { status: 500 });
    }
}

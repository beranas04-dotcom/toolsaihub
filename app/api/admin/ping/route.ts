import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/admin-session";

export async function GET() {
    const user = await getServerSessionUser();
    if (!user?.isAdmin) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
}

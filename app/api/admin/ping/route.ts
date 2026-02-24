import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
}
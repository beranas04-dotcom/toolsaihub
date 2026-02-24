import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const user = await getServerSessionUser(req);
    return NextResponse.json({ user });
}
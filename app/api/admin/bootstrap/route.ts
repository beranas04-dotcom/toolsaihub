import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
    // Just initializing admin + db connection (and optionally ensure collections exist)
    getAdminDb();
    return NextResponse.json({ ok: true });
}

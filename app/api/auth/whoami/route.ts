import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "aitoolshub_token";

export async function GET() {
    const session = cookies().get(COOKIE_NAME)?.value;
    if (!session) return NextResponse.json({ user: null });

    try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true);
        return NextResponse.json({
            user: {
                uid: decoded.uid,
                email: (decoded as any).email || null,
                admin: (decoded as any).admin === true,
            },
        });
    } catch (e: any) {
        console.error("WHOAMI_ERROR:", e?.message);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
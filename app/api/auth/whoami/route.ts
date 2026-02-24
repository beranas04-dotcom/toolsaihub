import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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
    } catch {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
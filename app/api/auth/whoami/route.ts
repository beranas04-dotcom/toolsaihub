import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "aitoolshub_token";

export async function GET(req: Request) {
    const cookie = req.headers.get("cookie") || "";
    const hasCookie = cookie.includes(`${COOKIE_NAME}=`);

    if (!hasCookie) return NextResponse.json({ user: null });

    try {
        // get session cookie value manually
        const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
        const session = match?.[1];
        if (!session) return NextResponse.json({ user: null });

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
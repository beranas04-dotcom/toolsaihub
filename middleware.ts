import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "aitoolshub_token"; // ✅ نفس الاسم

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // allow login page
    if (pathname === "/admin/login") return NextResponse.next();

    // protect admin pages
    if (pathname.startsWith("/admin")) {
        const session = req.cookies.get(COOKIE_NAME)?.value;
        if (!session) {
            const url = req.nextUrl.clone();
            url.pathname = "/admin/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
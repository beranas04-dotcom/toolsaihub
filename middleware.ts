import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.USER_COOKIE_NAME || "aitoolshub_token";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow admin login page
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // Protect all /admin routes
    if (pathname.startsWith("/admin")) {
        const session = req.cookies.get(COOKIE_NAME)?.value;

        if (!session) {
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = "/admin/login";
            loginUrl.searchParams.set("next", pathname);

            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
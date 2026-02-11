import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "aitoolshub_token";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // خلي /admin/login دايز
    if (pathname === "/admin/login") return NextResponse.next();

    // Protect any /admin/* page
    if (pathname.startsWith("/admin")) {
        const token = req.cookies.get(COOKIE_NAME)?.value;

        // إذا ما كاينش token => ردّو للـ login
        if (!token) {
            const url = req.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};

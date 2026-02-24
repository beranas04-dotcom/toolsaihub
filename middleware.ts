// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "aitoolshub_token";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const session = req.cookies.get(COOKIE_NAME)?.value;

    // Protect admin pages
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") return NextResponse.next();

        if (!session) {
            const url = req.nextUrl.clone();
            url.pathname = "/admin/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }

    // Protect admin APIs (gateway)
    if (pathname.startsWith("/api/admin")) {
        if (!session) {
            const auth = req.headers.get("authorization") || "";
            if (!auth.startsWith("Bearer ")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
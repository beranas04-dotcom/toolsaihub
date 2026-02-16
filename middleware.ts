// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // ✅ ما تمسّش API routes نهائياً
    if (req.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // ✅ خليه يدوز فباقي المسارات (إلا ما عندكش منطق آخر)
    return NextResponse.next();
}

// ✅ مهم: استثناء api وملفات next
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

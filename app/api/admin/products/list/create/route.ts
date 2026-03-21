import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_COOKIE_NAME = process.env.USER_COOKIE_NAME || "__user_session";
const ADMIN_COOKIE_FALLBACK = "aitoolshub_token";

function isAdminEmail(email?: string | null) {
    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (!email) return false;
    return list.includes(email.toLowerCase());
}

function cleanStr(x: any, max = 5000) {
    const s = String(x ?? "").trim();
    return s.length > max ? s.slice(0, max) : s;
}

function toTags(raw: string) {
    return raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 25);
}

async function getUidFromAnySessionCookie() {
    const jar = cookies();
    const a = jar.get(USER_COOKIE_NAME)?.value;
    const b = jar.get(ADMIN_COOKIE_FALLBACK)?.value;

    const token = a || b;
    if (!token) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(token, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const uid = await getUidFromAnySessionCookie();
        if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminAuth = getAdminAuth();
        const user = await adminAuth.getUser(uid);
        if (!isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

        const title = cleanStr(body.title, 140);
        const description = cleanStr(body.description, 600);
        const category = cleanStr(body.category, 60) || "general";
        const tier = body.tier === "free" ? "free" : "pro";
        const fileUrl = cleanStr(body.fileUrl, 200);
        const coverImage = cleanStr(body.coverImage, 500);
        const tags = toTags(cleanStr(body.tags, 400));
        const published = Boolean(body.published);

        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
        if (!fileUrl) return NextResponse.json({ error: "Drive fileId (fileUrl) is required" }, { status: 400 });

        const now = Date.now();
        const db = getAdminDb();
        const ref = db.collection("products").doc();

        await ref.set({
            title,
            description,
            category,
            tier,
            fileUrl,
            coverImage: coverImage || null,
            tags,
            published,
            createdAt: now,
            updatedAt: now,
            stats: { downloads: 0, lastDownloadedAt: null },
            createdBy: { uid, email: user.email || null },
        });

        return NextResponse.json({ ok: true, id: ref.id });
    } catch (err) {
        console.error("ADMIN_CREATE_PRODUCT_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
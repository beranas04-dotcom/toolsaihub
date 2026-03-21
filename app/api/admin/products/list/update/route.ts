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
        if (!body?.id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

        const id = cleanStr(body.id, 200);

        const patch: any = { updatedAt: Date.now() };
        if ("title" in body) patch.title = cleanStr(body.title, 140);
        if ("description" in body) patch.description = cleanStr(body.description, 600);
        if ("category" in body) patch.category = cleanStr(body.category, 60) || "general";
        if ("tier" in body) patch.tier = body.tier === "free" ? "free" : "pro";
        if ("fileUrl" in body) patch.fileUrl = cleanStr(body.fileUrl, 200);
        if ("coverImage" in body) patch.coverImage = cleanStr(body.coverImage, 500) || null;
        if ("tags" in body) patch.tags = toTags(cleanStr(body.tags, 400));
        if ("published" in body) patch.published = Boolean(body.published);

        if ("title" in patch && patch.title === "") {
            return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
        }
        if ("fileUrl" in patch && patch.fileUrl === "") {
            return NextResponse.json({ error: "Drive fileId (fileUrl) cannot be empty" }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection("products").doc(id).set(patch, { merge: true });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("ADMIN_PRODUCTS_UPDATE_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
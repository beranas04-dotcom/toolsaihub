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

async function getUidFromAnySessionCookie() {
    const jar = cookies();
    const token =
        jar.get(USER_COOKIE_NAME)?.value ||
        jar.get(ADMIN_COOKIE_FALLBACK)?.value;

    if (!token) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(token, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

function cleanStr(x: any, max = 5000) {
    const s = String(x ?? "").trim();
    return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
    try {
        const uid = await getUidFromAnySessionCookie();
        if (!uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();
        const user = await adminAuth.getUser(uid);

        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid body" }, { status: 400 });
        }

        const id = cleanStr(body.id, 180).toLowerCase();
        if (!id) {
            return NextResponse.json({ error: "Category id is required" }, { status: 400 });
        }

        const patch: any = {
            updatedAt: Date.now(),
        };

        if ("name" in body) patch.name = cleanStr(body.name, 120);
        if ("slug" in body) patch.slug = cleanStr(body.slug, 180).toLowerCase();
        if ("description" in body) patch.description = cleanStr(body.description, 2000);
        if ("icon" in body) patch.icon = cleanStr(body.icon, 80);
        if ("order" in body) patch.order = Number(body.order || 0);
        if ("published" in body) patch.published = Boolean(body.published);

        const db = getAdminDb();

        const ref = db.collection("categories").doc(id);
        const snap = await ref.get();

        if (!snap.exists) {
            patch.createdAt = Date.now();
            patch.createdBy = user.email || null;
        }

        await ref.set(patch, { merge: true });

        return NextResponse.json({ ok: true, id });
    } catch (err) {
        console.error("ADMIN_CATEGORIES_UPSERT_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
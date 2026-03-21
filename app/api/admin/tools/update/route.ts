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
        const id = cleanStr(body?.id, 200);

        if (!id) {
            return NextResponse.json({ error: "Missing tool id" }, { status: 400 });
        }

        const patch: any = {
            updatedAt: Date.now(),
        };

        if ("name" in body) patch.name = cleanStr(body.name, 160);
        if ("slug" in body) patch.slug = cleanStr(body.slug, 180).toLowerCase();
        if ("description" in body) patch.description = cleanStr(body.description, 5000);
        if ("category" in body) patch.category = cleanStr(body.category, 80) || "general";
        if ("website" in body) patch.website = cleanStr(body.website, 1000);
        if ("logo" in body) patch.logo = cleanStr(body.logo, 1000);
        if ("pricing" in body) patch.pricing = cleanStr(body.pricing, 80);
        if ("affiliateUrl" in body) patch.affiliateUrl = cleanStr(body.affiliateUrl, 2000) || null;
        if ("affiliateNetwork" in body) patch.affiliateNetwork = cleanStr(body.affiliateNetwork, 120) || null;
        if ("published" in body) patch.published = Boolean(body.published);
        if ("featured" in body) patch.featured = Boolean(body.featured);

        if ("sponsored" in body) patch.sponsored = Boolean(body.sponsored);
        if ("sponsorTier" in body) patch.sponsorTier = cleanStr(body.sponsorTier, 40) || "none";

        if ("sponsorPriority" in body) {
            const n = Number(body.sponsorPriority || 0);
            patch.sponsorPriority = Number.isFinite(n) ? n : 0;
        }

        if ("sponsorUntil" in body) patch.sponsorUntil = body.sponsorUntil || null;
        if ("sponsorLabel" in body) patch.sponsorLabel = cleanStr(body.sponsorLabel, 80) || null;

        const db = getAdminDb();
        await db.collection("tools").doc(id).set(patch, { merge: true });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("ADMIN_TOOLS_UPDATE_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
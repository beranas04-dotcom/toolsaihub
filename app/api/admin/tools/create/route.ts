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

        const name = cleanStr(body.name, 160);
        const slug = cleanStr(body.slug, 180).toLowerCase();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const sponsored = Boolean(body.sponsored);
        const sponsorPriority = Number(body.sponsorPriority || 0);

        const db = getAdminDb();

        await db.collection("tools").doc(slug).set({
            name,
            slug,
            description: cleanStr(body.description, 5000),
            category: cleanStr(body.category, 80) || "general",
            website: cleanStr(body.website, 1000),
            logo: cleanStr(body.logo, 1000),
            pricing: cleanStr(body.pricing, 80),
            affiliateUrl: cleanStr(body.affiliateUrl, 2000) || null,
            affiliateNetwork: cleanStr(body.affiliateNetwork, 120) || null,
            published: Boolean(body.published),
            featured: Boolean(body.featured),
            sponsored,
            sponsorTier: sponsored ? cleanStr(body.sponsorTier, 40) || "featured" : "none",
            sponsorPriority: sponsored && Number.isFinite(sponsorPriority) ? sponsorPriority : 0,
            sponsorUntil: sponsored ? (body.sponsorUntil || null) : null,
            sponsorLabel: sponsored ? cleanStr(body.sponsorLabel, 80) || "Sponsored" : null,
            clicks: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user.email || null,
        });

        return NextResponse.json({ ok: true, id: slug });
    } catch (err) {
        console.error("ADMIN_TOOLS_CREATE_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
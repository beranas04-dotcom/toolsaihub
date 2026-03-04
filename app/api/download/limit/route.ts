// app/api/download/limit/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = process.env.USER_COOKIE_NAME || "__user_session";
const FREE_LIMIT_UID = Number(process.env.FREE_DOWNLOADS_PER_DAY || 3);
const PRO_LIMIT_UID = Number(process.env.PRO_DOWNLOADS_PER_DAY || 50);

const FREE_LIMIT_IP = Number(process.env.FREE_DOWNLOADS_PER_DAY_PER_IP || 10);
const PRO_LIMIT_IP = Number(process.env.PRO_DOWNLOADS_PER_DAY_PER_IP || 200);

function todayKeyUTC() {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}${m}${day}`;
}

function getIP(): string {
    const h = headers();
    const xf = h.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    return h.get("x-real-ip") || "unknown";
}

function hashIP(ip: string) {
    return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function getUidFromSessionCookie(): Promise<string | null> {
    const sessionCookie = cookies().get(COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decoded?.uid || null;
    } catch {
        return null;
    }
}

export async function GET() {
    const uid = await getUidFromSessionCookie();
    if (!uid) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(uid).get();
    const isProActive = userSnap.data()?.subscription?.status === "active";

    const plan = isProActive ? ("pro" as const) : ("free" as const);
    const limitUid = plan === "pro" ? PRO_LIMIT_UID : FREE_LIMIT_UID;
    const limitIp = plan === "pro" ? PRO_LIMIT_IP : FREE_LIMIT_IP;

    const dateKey = todayKeyUTC();
    const ipKey = hashIP(getIP());

    const uidDocId = `${uid}_${dateKey}`;
    const ipDocId = `${ipKey}_${dateKey}`;

    const [uidLimSnap, ipLimSnap] = await Promise.all([
        db.collection("download_limits").doc(uidDocId).get(),
        db.collection("download_ip_limits").doc(ipDocId).get(),
    ]);

    const usedUid = uidLimSnap.exists ? Number((uidLimSnap.data() as any)?.count || 0) : 0;
    const usedIp = ipLimSnap.exists ? Number((ipLimSnap.data() as any)?.count || 0) : 0;

    return NextResponse.json({
        authenticated: true,
        plan,
        uid: { used: usedUid, limit: limitUid, remaining: Math.max(0, limitUid - usedUid) },
        ip: { used: usedIp, limit: limitIp, remaining: Math.max(0, limitIp - usedIp) },
        dateKey,
    });
}
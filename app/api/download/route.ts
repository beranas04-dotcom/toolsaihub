// app/api/download/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { Readable } from "stream";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { getDriveClient } from "@/lib/googleDrive";

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
    return `${y}${m}${day}`; // e.g. 20260302
}

function getIP(): string {
    const h = headers();
    const xf = h.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    return h.get("x-real-ip") || "unknown";
}

function safeUA() {
    return headers().get("user-agent") || "";
}

function sanitizeFilename(name: string) {
    return name.replace(/[/\\?%*:|"<>]/g, "-");
}

function hashIP(ip: string) {
    // docId safe + no PII direct
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

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const productId = url.searchParams.get("productId")?.trim();

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        // 1) Auth required
        const uid = await getUidFromSessionCookie();
        if (!uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getAdminDb();

        // 2) Load product
        const prodRef = db.collection("products").doc(productId);
        const prodSnap = await prodRef.get();

        if (!prodSnap.exists) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const product = prodSnap.data() as any;
        const title = String(product?.title || "download");
        const tier = (product?.tier === "free" ? "free" : "pro") as "free" | "pro";

        // ✅ fileUrl == Drive fileId
        const fileId = typeof product?.fileUrl === "string" ? product.fileUrl.trim() : "";
        if (!fileId) {
            return NextResponse.json(
                { error: "Missing fileUrl (Drive fileId) on product" },
                { status: 400 }
            );
        }

        // 3) Subscription check (pro products)
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();
        const isProActive = userSnap.data()?.subscription?.status === "active";

        if (tier === "pro" && !isProActive) {
            return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
        }

        // 4) Limits
        const plan = isProActive ? ("pro" as const) : ("free" as const);
        const limitUid = plan === "pro" ? PRO_LIMIT_UID : FREE_LIMIT_UID;
        const limitIp = plan === "pro" ? PRO_LIMIT_IP : FREE_LIMIT_IP;

        const dateKey = todayKeyUTC();
        const ip = getIP();
        const ipKey = hashIP(ip);
        const ua = safeUA();

        const limitUidDocId = `${uid}_${dateKey}`;
        const limitIpDocId = `${ipKey}_${dateKey}`;

        const limitUidRef = db.collection("download_limits").doc(limitUidDocId);
        const limitIpRef = db.collection("download_ip_limits").doc(limitIpDocId);
        const logRef = db.collection("download_logs").doc();

        let remainingUid = 0;
        let remainingIp = 0;

        // 5) Transaction: enforce BOTH uid+ip + logs + counters
        await db.runTransaction(async (tx) => {
            const [uidSnap, ipSnap] = await Promise.all([tx.get(limitUidRef), tx.get(limitIpRef)]);

            const currentUid = uidSnap.exists ? Number((uidSnap.data() as any)?.count || 0) : 0;
            const currentIp = ipSnap.exists ? Number((ipSnap.data() as any)?.count || 0) : 0;

            if (currentUid >= limitUid) throw new Error("RATE_LIMIT_UID");
            if (currentIp >= limitIp) throw new Error("RATE_LIMIT_IP");

            remainingUid = Math.max(0, limitUid - (currentUid + 1));
            remainingIp = Math.max(0, limitIp - (currentIp + 1));

            tx.set(
                limitUidRef,
                {
                    uid,
                    plan,
                    dateKey,
                    limit: limitUid,
                    count: FieldValue.increment(1),
                    updatedAt: Date.now(),
                    createdAt: uidSnap.exists ? (uidSnap.data() as any)?.createdAt || Date.now() : Date.now(),
                },
                { merge: true }
            );

            tx.set(
                limitIpRef,
                {
                    ipHash: ipKey,
                    plan,
                    dateKey,
                    limit: limitIp,
                    count: FieldValue.increment(1),
                    updatedAt: Date.now(),
                    createdAt: ipSnap.exists ? (ipSnap.data() as any)?.createdAt || Date.now() : Date.now(),
                },
                { merge: true }
            );

            tx.set(logRef, {
                uid,
                ipHash: ipKey,
                userAgent: ua,
                productId,
                productTitle: title,
                productTier: tier,
                plan,
                fileId,
                createdAt: Date.now(),
            });

            tx.set(
                prodRef,
                { stats: { downloads: FieldValue.increment(1), lastDownloadedAt: Date.now() } },
                { merge: true }
            );

            tx.set(
                userRef,
                { stats: { downloads: FieldValue.increment(1), lastDownloadedAt: Date.now() } },
                { merge: true }
            );
        });

        // 6) Stream from Google Drive
        const drive = getDriveClient();

        const meta = await drive.files.get({
            fileId,
            fields: "name,mimeType",
            supportsAllDrives: true,
        });

        const filename = sanitizeFilename(meta.data.name || `${title}.pdf`);
        const mimeType = meta.data.mimeType || "application/octet-stream";

        const fileRes = await drive.files.get(
            { fileId, alt: "media", supportsAllDrives: true },
            { responseType: "stream" }
        );

        const nodeStream = fileRes.data as any;
        const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

        return new Response(webStream, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "private, no-store, max-age=0",

                // helpful headers for UI/badge debugging
                "X-Plan": plan,
                "X-UID-Limit": String(limitUid),
                "X-UID-Remaining": String(remainingUid),
                "X-IP-Limit": String(limitIp),
                "X-IP-Remaining": String(remainingIp),
            },
        });
    } catch (err: any) {
        const msg = String(err?.message || "");

        if (msg.includes("RATE_LIMIT_UID")) {
            return NextResponse.json(
                { error: "Daily download limit reached for your account. Try again tomorrow." },
                { status: 429 }
            );
        }

        if (msg.includes("RATE_LIMIT_IP")) {
            return NextResponse.json(
                { error: "Daily download limit reached for your network (IP). Try again tomorrow." },
                { status: 429 }
            );
        }

        if (msg.includes("Google Drive API has not been used") || msg.includes("is disabled")) {
            return NextResponse.json(
                { error: "Google Drive API is disabled. Enable it in Google Cloud Console." },
                { status: 500 }
            );
        }

        console.error("DOWNLOAD_API_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
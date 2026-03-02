import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(): string | null {
    const h = headers();
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || null;
    return h.get("x-real-ip");
}

function dayKeyUTC(ts = Date.now()) {
    const d = new Date(ts);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

function getDriveAuth() {
    const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const pkB64 = process.env.GOOGLE_DRIVE_PRIVATE_KEY_B64;

    if (!clientEmail || !pkB64) throw new Error("Missing Drive env vars");

    const privateKey = Buffer.from(pkB64, "base64")
        .toString("utf8")
        .replace(/\\n/g, "\n");

    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

        // 1) Verify session cookie (login required)
        const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
        const sessionCookie = cookies().get(cookieName)?.value;
        if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decoded?.uid;
        if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const db = getAdminDb();

        // 2) Load product
        const prodRef = db.collection("products").doc(productId);
        const prodSnap = await prodRef.get();
        if (!prodSnap.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const product = prodSnap.data() as any;
        const fileId = product?.fileUrl as string | undefined; // fileUrl now stores Drive FILE_ID
        const tier = (product?.tier || "pro") as "free" | "pro";
        const title = (product?.title || "download") as string;

        if (!fileId) return NextResponse.json({ error: "File not available" }, { status: 404 });

        // 3) User (Pro status + limit decision)
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();
        const isProActive = userSnap.data()?.subscription?.status === "active";

        if (tier === "pro" && !isProActive) {
            return NextResponse.json({ error: "Pro required" }, { status: 403 });
        }

        // 4) Rate limit per day (per user)
        const PRO_LIMIT = Number(process.env.PRO_DOWNLOADS_PER_DAY || 50);
        const FREE_LIMIT = Number(process.env.FREE_DOWNLOADS_PER_DAY || 10);
        const limit = isProActive ? PRO_LIMIT : FREE_LIMIT;

        const day = dayKeyUTC();
        const rlRef = db.collection("rate_limits").doc(`${uid}_${day}`);

        const ip = getClientIp();
        const ua = headers().get("user-agent");
        const logRef = db.collection("download_logs").doc();

        await db.runTransaction(async (tx) => {
            const rlSnap = await tx.get(rlRef);
            const used = rlSnap.exists ? Number((rlSnap.data() as any)?.count || 0) : 0;
            if (used >= limit) throw new Error("RATE_LIMIT");

            tx.set(
                rlRef,
                {
                    uid,
                    day,
                    limit,
                    count: FieldValue.increment(1),
                    updatedAt: Date.now(),
                    createdAt: rlSnap.exists ? (rlSnap.data() as any)?.createdAt || Date.now() : Date.now(),
                },
                { merge: true }
            );

            tx.set(logRef, {
                uid,
                productId,
                productTitle: title,
                tier,
                createdAt: Date.now(),
                ip: ip || null,
                ua: ua || null,
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

        // 5) Stream from Google Drive (private)
        const auth = getDriveAuth();
        const drive = google.drive({ version: "v3", auth });

        const meta = await drive.files.get({
            fileId,
            fields: "name,mimeType",
            supportsAllDrives: true,
        });

        const filename = (meta.data.name || title || "download").replace(/[/\\?%*:|"<>]/g, "-");
        const mimeType = meta.data.mimeType || "application/octet-stream";

        const fileRes = await drive.files.get(
            { fileId, alt: "media", supportsAllDrives: true },
            { responseType: "stream" }
        );

        const stream = fileRes.data as any;

        return new Response(stream as any, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "private, no-store, max-age=0",
            },
        });
    } catch (e: any) {
        if (String(e?.message || "").includes("RATE_LIMIT")) {
            return NextResponse.json(
                { error: "Daily download limit reached. Please try again tomorrow." },
                { status: 429 }
            );
        }

        console.error("DOWNLOAD_API_ERROR:", e?.message || e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
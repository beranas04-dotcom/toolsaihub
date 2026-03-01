import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(): string | null {
    // Vercel / proxies
    const h = headers();
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || null;
    return h.get("x-real-ip");
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        // 1) Verify session cookie
        const cookieName = process.env.USER_COOKIE_NAME || "__user_session";
        const sessionCookie = cookies().get(cookieName)?.value;
        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decoded?.uid;
        if (!uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getAdminDb();

        // 2) Load product
        const prodSnap = await db.collection("products").doc(productId).get();
        if (!prodSnap.exists) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const product = prodSnap.data() as any;
        const fileUrl = product?.fileUrl as string | undefined;
        const tier = (product?.tier || "pro") as "free" | "pro";
        const title = (product?.title || "Untitled") as string;

        if (!fileUrl) {
            return NextResponse.json({ error: "File not available" }, { status: 404 });
        }

        // 3) Check subscription only if tier is pro
        if (tier === "pro") {
            const userSnap = await db.collection("users").doc(uid).get();
            const status = userSnap.data()?.subscription?.status;
            if (status !== "active") {
                return NextResponse.json({ error: "Pro required" }, { status: 403 });
            }
        }

        // 4) TRACK DOWNLOAD (server-side)
        const ip = getClientIp();
        const ua = headers().get("user-agent");

        const logRef = db.collection("download_logs").doc(); // auto id

        const productRef = db.collection("products").doc(productId);
        const userRef = db.collection("users").doc(uid);

        await db.runTransaction(async (tx) => {
            tx.set(logRef, {
                uid,
                productId,
                productTitle: title,
                tier,
                createdAt: Date.now(),
                ip: ip || null,
                ua: ua || null,
            });

            // increment counters
            tx.set(
                productRef,
                {
                    stats: {
                        downloads: admin.firestore.FieldValue.increment(1),
                        lastDownloadedAt: Date.now(),
                    },
                },
                { merge: true }
            );

            tx.set(
                userRef,
                {
                    stats: {
                        downloads: admin.firestore.FieldValue.increment(1),
                        lastDownloadedAt: Date.now(),
                    },
                },
                { merge: true }
            );
        });

        // 5) Redirect to file
        return NextResponse.redirect(fileUrl, { status: 302 });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
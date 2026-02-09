import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

function getBearerToken(req: Request) {
    const authHeader = req.headers.get("authorization") || "";
    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

export async function GET(req: Request) {
    try {
        const token = getBearerToken(req);
        if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

        const decoded = await getAdminAuth().verifyIdToken(token);

        const { searchParams } = new URL(req.url);
        const toolId = String(searchParams.get("toolId") || "").trim();
        if (!toolId) return NextResponse.json({ error: "toolId required" }, { status: 400 });

        const db = getAdminDb();
        const reviewId = `${toolId}_${decoded.uid}`;
        const snap = await db.collection("reviews").doc(reviewId).get();

        if (!snap.exists) return NextResponse.json({ review: null });

        const data = snap.data() || {};
        return NextResponse.json({
            review: {
                id: snap.id,
                toolId: data.toolId,
                rating: data.rating,
                title: data.title || "",
                text: data.text || "",
                status: data.status,
                createdAt: data.createdAt || null,
                updatedAt: data.updatedAt || null,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = getBearerToken(req);
        if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

        const decoded = await getAdminAuth().verifyIdToken(token);

        const body = await req.json();
        const toolId = String(body.toolId || "").trim();
        const rating = Number(body.rating);
        const title = String(body.title || "").trim();
        const text = String(body.text || "").trim();

        if (!toolId) return NextResponse.json({ error: "toolId required" }, { status: 400 });
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "rating must be 1..5" }, { status: 400 });
        }
        if (text.length < 20) {
            return NextResponse.json({ error: "review too short (min 20 chars)" }, { status: 400 });
        }

        const db = getAdminDb();
        const reviewId = `${toolId}_${decoded.uid}`;
        const ref = db.collection("reviews").doc(reviewId);

        const existing = await ref.get();
        const now = new Date();

        if (!existing.exists) {
            // ✅ Create
            await ref.set({
                toolId,
                rating,
                title: title || "",
                text,
                status: "pending",
                userId: decoded.uid,
                userEmail: decoded.email || null,
                userName: (decoded as any).name || null,
                createdAt: now,
                updatedAt: now,
            });

            return NextResponse.json({ ok: true, mode: "created", reviewId });
        }

        // ✅ Update (Edit) -> يرجع Pending باش يتراجع من جديد
        const prev = existing.data() || {};
        await ref.set(
            {
                toolId,
                rating,
                title: title || "",
                text,
                status: "pending",
                updatedAt: now,

                // نخلي createdAt كيما كان
                createdAt: prev.createdAt || now,
                userId: prev.userId || decoded.uid,
                userEmail: prev.userEmail ?? decoded.email ?? null,
                userName: prev.userName ?? (decoded as any).name ?? null,
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true, mode: "updated", reviewId });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

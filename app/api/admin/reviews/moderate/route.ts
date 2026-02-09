import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getAdminAuth, getDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

        const decoded = await getAdminAuth().verifyIdToken(token);
        if (decoded.admin !== true) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

        const body = await req.json();
        const reviewId = String(body?.reviewId || "");
        const action = body?.action === "reject" ? "reject" : "approve";
        const reason = String(body?.reason || "");

        if (!reviewId) return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });

        const db = getDb();
        const ref = db.collection("reviews").doc(reviewId);
        const snap = await ref.get();
        if (!snap.exists) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        const nextStatus = action === "approve" ? "approved" : "rejected";

        await ref.set(
            {
                status: nextStatus,
                moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
                moderatedBy: decoded.uid,
                moderatedByEmail: decoded.email || null,
                rejectReason: action === "reject" ? reason : null,
            },
            { merge: true }
        );

        return NextResponse.json({ ok: true, status: nextStatus });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

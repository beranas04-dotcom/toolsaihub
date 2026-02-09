import { NextResponse } from "next/server";
import { getAdminAuth, getDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 });
        }

        const decoded = await getAdminAuth().verifyIdToken(token);
        const uid = decoded.uid;

        const body = await req.json().catch(() => null);
        const toolId = String(body?.toolId || "").trim();
        const rating = Number(body?.rating);
        const title = String(body?.title || "").trim();
        const text = String(body?.text || "").trim();

        if (!toolId) return NextResponse.json({ error: "toolId is required" }, { status: 400 });
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "rating must be 1..5" }, { status: 400 });
        }
        if (title.length < 3) return NextResponse.json({ error: "title too short" }, { status: 400 });
        if (text.length < 20) return NextResponse.json({ error: "text too short" }, { status: 400 });

        const db = getDb();

        const docRef = db.collection("reviews").doc(); // auto id
        await docRef.set({
            toolId,
            rating,
            title,
            text,
            status: "pending",
            userId: uid,
            userEmail: decoded.email || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, id: docRef.id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

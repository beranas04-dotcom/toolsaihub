import { NextResponse } from "next/server";
import { getAdminAuth, getDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

        const decoded = await getAdminAuth().verifyIdToken(token);
        if (decoded.admin !== true) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

        const db = getDb();
        const snap = await db
            .collection("reviews")
            .where("status", "==", "pending")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        return NextResponse.json({ reviews });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

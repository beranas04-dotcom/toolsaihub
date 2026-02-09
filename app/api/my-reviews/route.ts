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
        const db = getAdminDb();

        const snap = await db
            .collection("reviews")
            .where("userId", "==", decoded.uid)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const items = snap.docs.map((d) => {
            const r = d.data() as any;
            const createdAt =
                typeof r?.createdAt?.toDate === "function"
                    ? r.createdAt.toDate().toISOString()
                    : r?.createdAt ?? null;

            return {
                id: d.id,
                toolId: r.toolId,
                toolName: r.toolName ?? "",
                rating: Number(r.rating || 0),
                title: r.title ?? "",
                text: r.text ?? "",
                status: r.status,
                createdAt,
            };
        });

        return NextResponse.json({ items });
    } catch (e: any) {
        const msg = String(e?.message || "Error");
        if (msg.includes("FAILED_PRECONDITION") && msg.includes("requires an index")) {
            return NextResponse.json({ error: "Firestore index missing for my-reviews query." }, { status: 500 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

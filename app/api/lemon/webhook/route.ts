import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const db = getAdminDb();
    const payload = await req.json().catch(() => null);

    // ✅ هنا غادي نحتاجو نعرف شنو كيجي من Lemon (event schema)
    // دابا نخليها كتسجل raw event فالFirestore باش نشوفو الشكل الحقيقي
    await db.collection("lemonWebhookLogs").add({
        createdAt: Date.now(),
        payload,
    });

    return NextResponse.json({ received: true });
}
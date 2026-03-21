import { NextResponse } from "next/server";
import { getSessionUid } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    const uid = await getSessionUid();
    if (!uid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = getAdminDb();

    await db
        .collection("users")
        .doc(uid)
        .collection("notifications")
        .doc(id)
        .update({ read: true });

    return NextResponse.json({ success: true });
}
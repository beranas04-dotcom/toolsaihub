import { NextResponse } from "next/server";
import { getSessionUid } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/notifications";

export async function GET() {
    const uid = await getSessionUid();

    if (!uid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getUserNotifications(uid);

    return NextResponse.json({ notifications });
}
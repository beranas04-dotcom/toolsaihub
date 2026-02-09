import "server-only";
import { getDb } from "@/lib/firebaseAdmin";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
    id: string;
    toolId: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    rating: number; // 1..5
    title?: string;
    text?: string;
    status: ReviewStatus;
    createdAt: string; // ISO
    updatedAt?: string; // ISO
};

export async function getApprovedReviews(toolId: string, limit = 10): Promise<Review[]> {
    const db = getDb();

    const snap = await db
        .collection("reviews")
        .where("toolId", "==", toolId)
        .where("status", "==", "approved")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
}

export async function getToolRatingSummary(toolId: string): Promise<{ avg: number; count: number }> {
    const db = getDb();

    // Small directory => iterate is ok. If you scale later, we’ll add aggregates.
    const snap = await db
        .collection("reviews")
        .where("toolId", "==", toolId)
        .where("status", "==", "approved")
        .get();

    const count = snap.size;
    if (!count) return { avg: 0, count: 0 };

    let sum = 0;
    snap.docs.forEach((d) => {
        const r = d.data() as any;
        sum += Number(r.rating || 0);
    });

    const avg = Math.round((sum / count) * 10) / 10; // 1 decimal
    return { avg, count };
}

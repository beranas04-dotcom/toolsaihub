import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import type { Review } from "@/types";

function parseDateMs(v?: string) {
    const ms = Date.parse(v || "");
    return Number.isFinite(ms) ? ms : 0;
}

export async function getApprovedReviewsForTool(args: {
    toolId: string;
    limit?: number;
}): Promise<Review[]> {
    const toolId = (args.toolId || "").trim();
    const limit = Math.max(1, Number(args.limit || 12));
    if (!toolId) return [];

    const db = getDb();

    // ✅ Avoid composite indexes:
    // We only filter by toolId in Firestore, then filter/sort in code.
    const snap = await db
        .collection("reviews")
        .where("toolId", "==", toolId)
        .limit(50)
        .get();

    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Review[];

    const approved = all
        .filter((r) => (r as any)?.status === "approved")
        .sort((a, b) => parseDateMs((b as any).createdAt) - parseDateMs((a as any).createdAt))
        .slice(0, limit);

    return approved;
}

export async function getReviewsSummaryForTool(toolId: string): Promise<{
    averageRating: number;
    reviewCount: number;
}> {
    const reviews = await getApprovedReviewsForTool({ toolId, limit: 50 });

    const ratings = reviews
        .map((r) => Number((r as any).rating))
        .filter((n) => Number.isFinite(n) && n > 0);

    const reviewCount = ratings.length;
    const averageRating =
        reviewCount > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10) / 10 : 0;

    return { averageRating, reviewCount };
}

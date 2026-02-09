import { getDb, getAdminAuth } from "@/lib/firebaseAdmin";
import AdminReviewsClient from "./AdminReviewsClient";

export const dynamic = "force-dynamic";

type Review = {
    id: string;
    toolId: string;
    toolName?: string;
    rating: number;
    title?: string;
    text?: string;
    status: "pending" | "approved" | "rejected";
    userId: string;
    userName?: string;
    userEmail?: string;
    createdAt?: any;
    updatedAt?: any;
};

async function getPendingReviews(): Promise<Review[]> {
    const db = getDb();

    const snap = await db
        .collection("reviews")
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();

    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Review[];
    return all.filter((r) => r.status === "pending").slice(0, 100);
}

function toIsoMaybe(x: any) {
    if (!x) return null;
    // Firestore Timestamp (admin) has toDate()
    if (typeof x?.toDate === "function") return x.toDate().toISOString();
    // JS Date
    if (x instanceof Date) return x.toISOString();
    // already string/number
    if (typeof x === "string" || typeof x === "number") return x;
    return null;
}

export default async function AdminReviewsPage() {
    getAdminAuth(); // ensure Admin SDK initialized
    const initial = await getPendingReviews();

    // ✅ IMPORTANT: pass only plain JSON to client component
    const safeInitial = initial.map((r) => ({
        id: r.id,
        toolId: r.toolId,
        toolName: r.toolName ?? "",
        rating: Number(r.rating || 0),
        title: r.title ?? "",
        text: r.text ?? "",
        status: r.status,
        userId: r.userId,
        userName: r.userName ?? "",
        userEmail: r.userEmail ?? "",
        createdAt: toIsoMaybe(r.createdAt),
        updatedAt: toIsoMaybe(r.updatedAt),
    }));

    return <AdminReviewsClient initialReviews={safeInitial} />;
}

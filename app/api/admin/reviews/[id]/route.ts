import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getDb } from "@/lib/firebaseAdmin";

function clampRating(x: any) {
    const n = Number(x);
    if (!Number.isFinite(n)) return 0;
    return Math.max(1, Math.min(5, n));
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 });
        }

        const decoded = await getAdminAuth().verifyIdToken(token);

        // Keep existing behavior: requires custom claim { admin: true }
        if (decoded.admin !== true) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });
        }

        const { action, reason } = await req.json().catch(() => ({}));
        const reviewId = params.id;

        const nextStatus: "approved" | "rejected" =
            action === "rejected" ? "rejected" : "approved";

        const db = getDb();
        const reviewRef = db.collection("reviews").doc(reviewId);

        await db.runTransaction(async (tx) => {
            const reviewSnap = await tx.get(reviewRef);
            if (!reviewSnap.exists) throw new Error("Review not found");

            const review = reviewSnap.data() as any;

            const toolId = String(review.toolId || "").trim();
            if (!toolId) throw new Error("Review missing toolId");

            const toolRef = db.collection("tools").doc(toolId);
            const toolSnap = await tx.get(toolRef);
            if (!toolSnap.exists) throw new Error("Tool not found");

            const tool = toolSnap.data() as any;

            const prevAvg = typeof tool.ratingAvg === "number" ? tool.ratingAvg : 0;
            const prevCount = typeof tool.ratingCount === "number" ? tool.ratingCount : 0;

            const currentStatus = review.status as "pending" | "approved" | "rejected";
            const newRating = clampRating(review.rating);

            // lastApprovedRating: كنخزنوها وقت approve باش edit يكون مضبوط
            const lastApprovedRating = clampRating(review.lastApprovedRating);

            let nextAvg = prevAvg;
            let nextCount = prevCount;

            if (nextStatus === "approved") {
                // ✅ Approve logic
                if (currentStatus === "approved") {
                    // already approved => idempotent
                    nextAvg = prevAvg;
                    nextCount = prevCount;
                } else if (currentStatus === "pending" || currentStatus === "rejected") {
                    // first time approve OR approving after rejected
                    if (lastApprovedRating > 0 && prevCount > 0) {
                        // edit approved again: remove old rating then add new rating (count stays same)
                        const total = prevAvg * prevCount;
                        const adjustedTotal = total - lastApprovedRating + newRating;
                        nextCount = prevCount;
                        nextAvg = nextCount ? adjustedTotal / nextCount : 0;
                    } else {
                        // first time approve: count +1
                        const total = prevAvg * prevCount;
                        nextCount = prevCount + 1;
                        nextAvg = nextCount ? (total + newRating) / nextCount : 0;
                    }
                }

                tx.set(
                    reviewRef,
                    {
                        status: "approved",
                        moderatedAt: FieldValue.serverTimestamp(),
                        moderatedBy: decoded.uid,
                        moderatedByEmail: decoded.email || null,
                        rejectReason: null,
                        approvedAt: FieldValue.serverTimestamp(),

                        // ✅ مهم: نخزنو rating اللي دخلات فـ aggregates
                        lastApprovedRating: newRating,
                    },
                    { merge: true }
                );

                tx.set(
                    toolRef,
                    {
                        ratingAvg: nextAvg,
                        ratingCount: nextCount,
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );
            } else {
                // ✅ Reject logic
                // إذا كانت already approved و بغينا نreject (نقصها من aggregates)
                if (currentStatus === "approved" && prevCount > 0) {
                    const usedRating = lastApprovedRating > 0 ? lastApprovedRating : newRating;
                    const total = prevAvg * prevCount;

                    nextCount = Math.max(0, prevCount - 1);
                    const nextTotal = total - usedRating;
                    nextAvg = nextCount ? nextTotal / nextCount : 0;
                }

                tx.set(
                    reviewRef,
                    {
                        status: "rejected",
                        moderatedAt: FieldValue.serverTimestamp(),
                        moderatedBy: decoded.uid,
                        moderatedByEmail: decoded.email || null,
                        rejectReason: String(reason || ""),
                        rejectedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

                tx.set(
                    toolRef,
                    {
                        ratingAvg: nextAvg,
                        ratingCount: nextCount,
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );
            }
        });

        return NextResponse.json({ ok: true, status: nextStatus });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
    }
}

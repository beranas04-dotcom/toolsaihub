import "server-only";
import admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebaseAdmin";

export type Submission = {
    id: string;
    toolName: string;
    websiteUrl: string;
    description?: string;
    category?: string;
    submitterEmail?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
};

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function listSubmissions(): Promise<Submission[]> {
    const db = getAdminDb();

    const snap = await db
        .collection("submissions")
        .orderBy("createdAt", "desc")
        .get();

    return snap.docs.map((d) => {
        const data = d.data() as any;

        const createdAt =
            data.createdAt?.toDate?.() instanceof Date
                ? data.createdAt.toDate().toISOString()
                : String(data.createdAt || new Date().toISOString());

        return {
            id: d.id,
            toolName: data.toolName || "",
            websiteUrl: data.websiteUrl || "",
            description: data.description || "",
            category: data.category || "",
            submitterEmail: data.submitterEmail || "",
            status: (data.status || "pending") as any,
            createdAt,
        };
    });
}

/**
 * ✅ Approve = creates Tool (pending) + deletes submission + logs moderation
 */
export async function approveSubmission(args: {
    submissionId: string;
    adminUid: string;
    adminEmail: string;
}) {
    const db = getAdminDb();
    const { submissionId, adminUid, adminEmail } = args;

    const submissionRef = db.collection("submissions").doc(submissionId);
    const logsRef = db.collection("moderation_logs").doc();

    await db.runTransaction(async (tx) => {
        const subSnap = await tx.get(submissionRef);
        if (!subSnap.exists) throw new Error("Submission not found");

        const sub = subSnap.data() as any;

        const toolName = String(sub.toolName || "").trim();
        const websiteUrl = String(sub.websiteUrl || "").trim();
        const category = String(sub.category || "").trim();

        if (!toolName || !websiteUrl || !category) {
            throw new Error("Submission missing required fields (toolName/websiteUrl/category)");
        }

        const toolId = normalizeId(sub.slug || toolName);
        if (!toolId) throw new Error("Invalid tool id");

        const toolRef = db.collection("tools").doc(toolId);

        // إذا tool موجود من قبل، من الأفضل ما نعاودوش إنشاءه
        const existingTool = await tx.get(toolRef);
        if (existingTool.exists) {
            throw new Error("Tool already exists with same slug/id");
        }

        const nowIso = new Date().toISOString();

        // ✅ Tool يدخل pending باش مايبانش فـ public حتى Publish
        tx.set(toolRef, {
            id: toolId,
            slug: toolId,
            name: toolName,
            websiteUrl,
            tagline: String(sub.tagline || "").trim(),
            description: String(sub.description || "").trim(),
            category,
            pricing: String(sub.pricing || "freemium"),
            tags: Array.isArray(sub.tags) ? sub.tags : [],
            status: "pending",
            featured: false,
            verified: false,
            freeTrial: Boolean(sub.freeTrial),

            // tracking
            source: "submission",
            submissionId,

            createdAt: nowIso,
            updatedAt: nowIso,
            lastUpdated: nowIso.slice(0, 10),
            reviewedBy: "AIToolsHub Team",
        }, { merge: true });

        // moderation log
        tx.set(logsRef, {
            action: "approve_submission",
            submissionId,
            toolId,
            adminUid,
            adminEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            meta: {
                toolName,
                websiteUrl,
                category,
                submitterEmail: String(sub.submitterEmail || ""),
            },
        });

        // delete submission
        tx.delete(submissionRef);
    });

    return { ok: true };
}

/**
 * ✅ Reject = delete submission + log
 */
export async function rejectSubmission(args: {
    submissionId: string;
    adminUid: string;
    adminEmail: string;
    reason?: string;
}) {
    const db = getAdminDb();
    const { submissionId, adminUid, adminEmail, reason } = args;

    const submissionRef = db.collection("submissions").doc(submissionId);
    const logsRef = db.collection("moderation_logs").doc();

    await db.runTransaction(async (tx) => {
        const subSnap = await tx.get(submissionRef);
        if (!subSnap.exists) throw new Error("Submission not found");

        const sub = subSnap.data() as any;

        tx.set(logsRef, {
            action: "reject_submission",
            submissionId,
            adminUid,
            adminEmail,
            reason: String(reason || ""),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            meta: {
                toolName: String(sub.toolName || ""),
                websiteUrl: String(sub.websiteUrl || ""),
                category: String(sub.category || ""),
                submitterEmail: String(sub.submitterEmail || ""),
            },
        });

        tx.delete(submissionRef);
    });

    return { ok: true };
}

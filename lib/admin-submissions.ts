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

function ensureHttps(url: string) {
    const v = String(url || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
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
            data.createdAt instanceof admin.firestore.Timestamp
                ? data.createdAt.toDate().toISOString()
                : String(data.createdAt || new Date().toISOString());

        return {
            id: d.id,
            toolName: String(data.toolName || ""),
            websiteUrl: String(data.websiteUrl || ""),
            description: String(data.description || ""),
            category: String(data.category || ""),
            submitterEmail: String(data.submitterEmail || ""),
            status: (data.status || "pending") as any,
            createdAt,
        };
    });
}

/**
 * ✅ Approve: submission -> tool (tools collection), delete from submissions, write log
 */
export async function approveSubmission(args: {
    submissionId: string;
    moderatorUid: string;
    moderatorEmail: string;
}) {
    const db = getAdminDb();
    const submissionRef = db.collection("submissions").doc(args.submissionId);

    await db.runTransaction(async (tx) => {
        const subSnap = await tx.get(submissionRef);
        if (!subSnap.exists) throw new Error("Submission not found");

        const sub = subSnap.data() as any;

        const name = String(sub.toolName || "").trim();
        const websiteUrl = ensureHttps(sub.websiteUrl || "");
        const description = String(sub.description || "").trim();
        const category = String(sub.category || "").trim();
        const submitterEmail = String(sub.submitterEmail || "").trim();

        if (!name) throw new Error("Submission missing toolName");
        if (!websiteUrl) throw new Error("Submission missing websiteUrl");

        const id = normalizeId(sub.id || name);
        const now = admin.firestore.FieldValue.serverTimestamp();

        const toolRef = db.collection("tools").doc(id);
        const logRef = db.collection("moderation_logs").doc();

        // Tool entry (starts as draft by default; admin can publish later)
        tx.set(
            toolRef,
            {
                id,
                slug: id,
                name,
                websiteUrl,
                description,
                category,
                status: "draft",
                featured: false,
                verified: false,
                freeTrial: false,
                tags: [],
                tagline: "",
                affiliateUrl: "",
                logo: "",
                createdAt: now,
                updatedAt: now,

                // provenance
                source: "submission",
                submissionId: args.submissionId,
                submitterEmail: submitterEmail || null,
            },
            { merge: true }
        );

        // moderation log
        tx.set(logRef, {
            type: "submission_approved",
            submissionId: args.submissionId,
            toolId: id,
            moderatorUid: args.moderatorUid,
            moderatorEmail: args.moderatorEmail,
            createdAt: now,
        });

        // delete submission
        tx.delete(submissionRef);
    });

    return { ok: true };
}

/**
 * ✅ Reject: mark rejected + log (keep submission for record)
 */
export async function rejectSubmission(args: {
    submissionId: string;
    moderatorUid: string;
    moderatorEmail: string;
    reason?: string;
}) {
    const db = getAdminDb();
    const submissionRef = db.collection("submissions").doc(args.submissionId);

    await db.runTransaction(async (tx) => {
        const subSnap = await tx.get(submissionRef);
        if (!subSnap.exists) throw new Error("Submission not found");

        const logRef = db.collection("moderation_logs").doc();
        const now = admin.firestore.FieldValue.serverTimestamp();

        tx.set(
            submissionRef,
            {
                status: "rejected",
                rejectedAt: now,
                rejectReason: String(args.reason || ""),
                moderatedBy: args.moderatorUid,
                moderatedByEmail: args.moderatorEmail,
                updatedAt: now,
            },
            { merge: true }
        );

        tx.set(logRef, {
            type: "submission_rejected",
            submissionId: args.submissionId,
            moderatorUid: args.moderatorUid,
            moderatorEmail: args.moderatorEmail,
            reason: String(args.reason || ""),
            createdAt: now,
        });
    });

    return { ok: true };
}

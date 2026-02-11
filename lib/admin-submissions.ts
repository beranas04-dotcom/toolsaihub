import { getAdminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

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

export async function listSubmissions(): Promise<Submission[]> {
    const db = getAdminDb();

    const snap = await db
        .collection("submissions")
        .orderBy("createdAt", "desc")
        .get();

    return snap.docs.map((d) => {
        const data = d.data() as any;

        return {
            id: d.id,
            toolName: data.toolName || "",
            websiteUrl: data.websiteUrl || "",
            description: data.description || "",
            category: data.category || "",
            submitterEmail: data.submitterEmail || "",
            status: data.status || "pending",
            createdAt:
                data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt || new Date().toISOString(),
        };
    });
}

export async function updateSubmissionStatus(
    id: string,
    status: "approved" | "rejected"
) {
    const db = getAdminDb();

    await db.collection("submissions").doc(id).update({
        status,
    });
}

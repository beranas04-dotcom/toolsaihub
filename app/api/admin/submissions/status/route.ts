import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requireAdminUser } from "@/lib/admin-session";

function slugify(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const adminUser = await requireAdminUser();
        const { id, action } = (await req.json()) as { id?: string; action?: "approve" | "reject" };

        if (!id || !action) {
            return NextResponse.json({ error: "Missing id/action" }, { status: 400 });
        }

        const db = getAdminDb();
        const subRef = db.collection("submissions").doc(id);
        const subSnap = await subRef.get();

        if (!subSnap.exists) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        const sub = subSnap.data() as any;
        const now = new Date().toISOString();

        if (action === "reject") {
            await subRef.update({ status: "rejected", reviewedAt: now, reviewedBy: adminUser.email });

            await db.collection("moderation_logs").add({
                type: "submission_rejected",
                submissionId: id,
                adminUid: adminUser.uid,
                adminEmail: adminUser.email,
                at: now,
            });

            return NextResponse.json({ ok: true });
        }

        // action === "approve"
        const toolName = sub.toolName || sub.name || "";
        const toolId = slugify(sub.slug || toolName || id) || id;

        const toolRef = db.collection("tools").doc(toolId);

        // إذا كاين tool بنفس id من قبل، ما نخربوش
        const existing = await toolRef.get();
        if (existing.exists) {
            // فقط log و حذف submission
            await db.collection("moderation_logs").add({
                type: "submission_approved_tool_exists",
                submissionId: id,
                toolId,
                adminUid: adminUser.uid,
                adminEmail: adminUser.email,
                at: now,
            });

            await subRef.delete();
            return NextResponse.json({ ok: true, toolId, note: "tool already existed" });
        }

        // Create tool from submission
        await toolRef.set(
            {
                id: toolId,
                name: toolName,
                slug: toolId,

                website: sub.websiteUrl || sub.website || "",
                tagline: sub.tagline || "",
                description: sub.description || "",
                category: (sub.category || "").toLowerCase().trim(), // حاول تخليه نفس taxonomy ديالك
                pricing: sub.pricing || "",

                status: "published",
                createdAt: now,
                updatedAt: now,

                // provenance
                submittedBy: sub.submitterEmail || "",
                source: "submission",
            },
            { merge: true }
        );

        // Delete submission
        await subRef.delete();

        // Moderation log
        await db.collection("moderation_logs").add({
            type: "submission_approved",
            submissionId: id,
            toolId,
            adminUid: adminUser.uid,
            adminEmail: adminUser.email,
            at: now,
        });

        return NextResponse.json({ ok: true, toolId });
    } catch (e: any) {
        console.error(e);
        const msg = e?.message || "Server error";
        const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}

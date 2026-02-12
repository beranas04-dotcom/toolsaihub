import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function getAdminEmailAllowlist() {
    return (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

function normalizeId(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const id = String(body?.id || "").trim();
        const status = String(body?.status || "").trim();

        if (!id)
            return NextResponse.json({ error: "Missing id" }, { status: 400 });

        if (!["approved", "rejected"].includes(status))
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });

        const token =
            cookies().get("__session")?.value ||
            cookies().get("aitoolshub_token")?.value;

        if (!token)
            return NextResponse.json({ error: "No token" }, { status: 401 });

        const decoded = await getAdminAuth().verifyIdToken(token);
        const email = String(decoded.email || "").toLowerCase();

        const allowlist = getAdminEmailAllowlist();
        if (!allowlist.includes(email))
            return NextResponse.json({ error: "Not allowed" }, { status: 403 });

        const db = getAdminDb();

        const submissionRef = db.collection("submissions").doc(id);
        const submissionSnap = await submissionRef.get();

        if (!submissionSnap.exists)
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });

        const submission = submissionSnap.data() as any;

        if (status === "approved") {
            const toolId = normalizeId(submission.toolName);

            const toolData = {
                id: toolId,
                slug: toolId,
                name: submission.toolName,
                websiteUrl: submission.websiteUrl,
                description: submission.description || "",
                category: submission.category || "",
                pricing: "freemium",
                status: "published",
                tags: [],
                featured: false,
                verified: false,
                freeTrial: false,

                source: "user",
                submittedBy: submission.submitterEmail || "",
                approvedAt: new Date().toISOString(),
                approvedBy: email,

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection("tools").doc(toolId).set(toolData);

            await submissionRef.delete();

            await db.collection("moderation_logs").add({
                submissionId: id,
                toolId,
                action: "approved",
                moderatedBy: email,
                moderatedAt: new Date().toISOString(),
            });
        }

        if (status === "rejected") {
            await submissionRef.update({
                status: "rejected",
            });

            await db.collection("moderation_logs").add({
                submissionId: id,
                action: "rejected",
                moderatedBy: email,
                moderatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

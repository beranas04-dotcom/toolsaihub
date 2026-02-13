import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requireAdminUser } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
    try {
        // ✅ hard block non-admin
        const admin = await requireAdminUser();

        const body = await req.json().catch(() => ({}));
        const id = String(body?.id || "").trim();
        const action = String(body?.action || "").trim(); // "approve" | "reject"

        if (!id) {
            return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
        }
        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const db = getAdminDb();

        const subRef = db.collection("submissions").doc(id);
        const subSnap = await subRef.get();

        if (!subSnap.exists) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        const sub = subSnap.data() as any;
        const nowIso = new Date().toISOString();

        // ✅ moderation log (always)
        const logRef = db.collection("moderation_logs").doc();
        const baseLog = {
            type: "submission",
            submissionId: id,
            action,
            adminUid: admin.uid,
            adminEmail: admin.email,
            createdAt: nowIso,
            payload: {
                toolName: sub?.toolName || "",
                websiteUrl: sub?.websiteUrl || "",
                category: sub?.category || "",
                submitterEmail: sub?.submitterEmail || "",
            },
        };

        if (action === "reject") {
            await subRef.set(
                {
                    status: "rejected",
                    moderatedAt: nowIso,
                    moderatedBy: admin.email,
                },
                { merge: true }
            );

            await logRef.set(baseLog);

            return NextResponse.json({ ok: true });
        }

        // ✅ APPROVE => create tool + delete submission + log
        const name = String(sub?.toolName || "").trim();
        const website = String(sub?.websiteUrl || "").trim();
        const category = String(sub?.category || "").trim();
        const description = String(sub?.description || "").trim();

        const toolId = normalizeId(sub?.slug || sub?.toolId || name);
        if (!toolId) {
            return NextResponse.json({ error: "Cannot generate tool id" }, { status: 400 });
        }

        // create tool doc (published مباشرة) — تقدر تخليه draft إذا بغيتي
        const toolRef = db.collection("tools").doc(toolId);

        await toolRef.set(
            {
                id: toolId,
                slug: toolId,
                name,
                websiteUrl: website, // إذا عندك schema ديال tools كيسميها websiteUrl
                website: website,    // وإذا كيسميها website
                description,
                category,
                tags: [],
                pricing: "freemium",
                status: "published",
                featured: false,
                verified: false,
                freeTrial: false,
                reviewedBy: "AIToolsHub Team",
                createdAt: nowIso,
                updatedAt: nowIso,
                lastUpdated: nowIso.slice(0, 10),
                // provenance
                source: "submission",
                submitterEmail: String(sub?.submitterEmail || "").trim(),
                submissionId: id,
            },
            { merge: true }
        );

        // delete submission
        await subRef.delete();

        // log with toolId
        await logRef.set({ ...baseLog, toolId });

        return NextResponse.json({ ok: true, toolId });
    } catch (e: any) {
        const msg = String(e?.message || "Server error");
        const status =
            msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;

        return NextResponse.json({ error: msg }, { status });
    }
}

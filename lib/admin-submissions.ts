// lib/admin-submissions.ts
import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";

function toIso(v: any): string | null {
    if (!v) return null;

    // Firestore Timestamp has .toDate()
    if (typeof v?.toDate === "function") {
        return v.toDate().toISOString();
    }

    // JS Date
    if (v instanceof Date) {
        return v.toISOString();
    }

    // already string
    if (typeof v === "string") return v;

    return null;
}

export type ToolSubmission = {
    id: string;
    name: string;
    website: string;
    tagline: string;
    description?: string;
    category: string;
    pricing: string;
    email: string;
    affiliateUrl?: string | null;
    logo?: string | null;
    tags?: string[]; // في الداتا كاين احتمال string أو array، غادي نصلحو فـ normalize
    status: "pending" | "approved" | "rejected";
    createdAt?: any;
    updatedAt?: any;
    approvedAt?: any;
    rejectedAt?: any;
    rejectReason?: string | null;
    source?: string;
};

function normalizeTags(input: any): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String).map((t) => t.trim()).filter(Boolean).slice(0, 12);
    if (typeof input === "string")
        return input
            .split(/[, ]+/)
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12);
    return [];
}

export async function listSubmissions(status: "pending" | "approved" | "rejected" = "pending") {
    const db = getAdminDb();

    // query by status + order by createdAt
    const snap = await db
        .collection("tool_submissions")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();

    return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: d.id,
            name: data.name || "",
            website: data.website || data.websiteUrl || "",
            tagline: data.tagline || "",
            description: data.description || "",
            category: data.category || "",
            pricing: data.pricing || "",
            email: data.email || "",
            affiliateUrl: data.affiliateUrl ?? null,
            logo: data.logo ?? null,
            tags: normalizeTags(data.tags),
            status: (data.status || "pending"),
            createdAt: toIso(data.createdAt),
            updatedAt: toIso(data.updatedAt),
            approvedAt: toIso(data.approvedAt),
            rejectedAt: toIso(data.rejectedAt),
            rejectReason: data.rejectReason ?? null,
            source: data.source ?? "public_submit",
        };

    });
}

export async function approveSubmission({ submissionId, adminUid, adminEmail }: { submissionId: string; adminUid?: string; adminEmail?: string }) {
    const db = getAdminDb();
    const subRef = db.collection("tool_submissions").doc(submissionId);
    const subSnap = await subRef.get();
    if (!subSnap.exists) throw new Error("Submission not found");

    const data = subSnap.data() as any;

    // ---- helpers (local) ----
    const normalizeId = (input: string) =>
        String(input || "")
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    const normalizePricingKey = (p: any) => {
        const v = String(p || "").toLowerCase().trim();
        if (!v) return "freemium";
        if (v === "free" || v.includes("free")) return "free";
        if (v.includes("credit")) return "credits";
        if (v.includes("enterprise")) return "enterprise";
        if (v.includes("subscription")) return "subscription";
        if (v.includes("paid") || v.includes("$") || v.includes("pro")) return "paid";
        if (v.includes("freemium")) return "freemium";
        return v;
    };

    const tagsArr = Array.isArray(data.tags)
        ? data.tags.map(String).map((t: string) => t.trim()).filter(Boolean).slice(0, 12)
        : typeof data.tags === "string"
            ? data.tags
                .split(/[, ]+/)
                .map((t: string) => t.trim())
                .filter(Boolean)
                .slice(0, 12)
            : [];

    // submission fields
    const name = String(data.name || "").trim();
    const website = String(data.website || data.websiteUrl || "").trim();
    const tagline = String(data.tagline || "").trim();
    const description = String(data.description || "").trim();
    const category = String(data.category || "").trim();
    const pricing = normalizePricingKey(data.pricing);

    if (!name || !website || !tagline || !category) {
        throw new Error("Submission is missing required fields (name/website/tagline/category).");
    }

    const nowIso = new Date().toISOString();
    const baseSlug = normalizeId(data.slug || name);
    if (!baseSlug) throw new Error("Could not generate slug from name.");

    // create tool doc id
    let toolId = baseSlug;

    // ensure unique doc id
    const exists = await db.collection("tools").doc(toolId).get();
    if (exists.exists) {
        toolId = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    // ✅ IMPORTANT CHANGE: create as DRAFT, not published
    const toolDoc = {
        id: toolId,
        slug: toolId,

        name,
        tagline,
        description,

        category,
        tags: tagsArr,

        affiliateUrl: data.affiliateUrl ? String(data.affiliateUrl).trim() : null,
        website,
        websiteUrl: website,

        logo: data.logo ? String(data.logo).trim() : null,

        pricing,
        freeTrial: false,
        pricingDetails: null,

        rating: 0,
        reviewCount: 0,

        featured: false,
        verified: false,

        features: [],
        useCases: [],
        pros: [],
        cons: [],

        // ✅ NEW: moderation metadata
        status: "draft",
        source: "public_submit",
        submissionId,

        createdAt: nowIso,
        updatedAt: nowIso,
        lastUpdated: nowIso.slice(0, 10),
        reviewedBy: adminEmail || "AIToolsHub Team",
    };

    await db.runTransaction(async (tx) => {
        const toolRef = db.collection("tools").doc(toolId);
        tx.set(toolRef, toolDoc, { merge: true });

        tx.set(
            subRef,
            {
                status: "approved",
                toolId,
                approvedAt: new Date(),
                updatedAt: new Date(),
                reviewedBy: adminEmail || "AIToolsHub Team",
            },
            { merge: true }
        );
    });

    return { ok: true, toolId };
}



export async function rejectSubmission(submissionId: string, reason?: string) {
    const db = getAdminDb();
    const ref = db.collection("tool_submissions").doc(submissionId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Submission not found");

    await ref.set(
        {
            status: "rejected",
            rejectReason: reason?.trim() ? reason.trim().slice(0, 300) : null,
            rejectedAt: new Date(),
            updatedAt: new Date(),
        },
        { merge: true }
    );

    return { ok: true };
}


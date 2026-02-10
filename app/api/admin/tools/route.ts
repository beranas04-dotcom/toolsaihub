import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

function normalizeId(input: string) {
    return input
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

function isValidHttpUrl(value: string) {
    try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

function toStringArray(v: any): string[] {
    // Accept array OR string (split by newlines)
    if (Array.isArray(v)) {
        return v.map((x) => String(x || "").trim()).filter(Boolean);
    }
    const s = String(v || "").trim();
    if (!s) return [];
    return s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
}

function uniqueLower(arr: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const x of arr) {
        const k = x.toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            out.push(x);
        }
    }
    return out;
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));

        const name = String(body?.name || "").trim();
        const slug = normalizeId(String(body?.slug || body?.id || name));
        const category = String(body?.category || "").trim();

        const websiteUrl = ensureHttps(body?.websiteUrl || body?.website || "");
        const affiliateUrl = ensureHttps(body?.affiliateUrl || "");
        const logo = ensureHttps(body?.logo || "");

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        if (!websiteUrl) return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
        if (!isValidHttpUrl(websiteUrl))
            return NextResponse.json({ error: "Website URL is invalid" }, { status: 400 });
        if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

        if (affiliateUrl && !isValidHttpUrl(affiliateUrl))
            return NextResponse.json({ error: "Affiliate URL is invalid" }, { status: 400 });

        if (logo && !isValidHttpUrl(logo))
            return NextResponse.json({ error: "Logo URL is invalid" }, { status: 400 });

        const tags = uniqueLower(
            (Array.isArray(body?.tags) ? body.tags : [])
                .map((t: any) => String(t || "").trim())
                .filter(Boolean)
        );

        const nowIso = new Date().toISOString();
        const lastUpdated =
            String(body?.lastUpdated || "").trim() || nowIso.slice(0, 10);

        const tool = {
            // identity
            id: slug,
            slug,

            // content
            name,
            websiteUrl,
            affiliateUrl: affiliateUrl || "",
            logo: logo || "",
            tagline: String(body?.tagline || "").trim(),
            description: String(body?.description || "").trim(),
            category,
            pricing: String(body?.pricing || "freemium"),
            tags,

            // flags
            status: body?.status === "published" ? "published" : "draft",
            featured: Boolean(body?.featured),
            verified: Boolean(body?.verified),
            freeTrial: Boolean(body?.freeTrial),

            // rich arrays
            features: toStringArray(body?.features),
            pros: toStringArray(body?.pros),
            cons: toStringArray(body?.cons),
            useCases: toStringArray(body?.useCases),

            // meta
            reviewedBy: String(body?.reviewedBy || "AIToolsHub Team").trim(),
            lastUpdated,
            updatedAt: nowIso,

            // keep createdAt if already exists in doc
            createdAt: String(body?.createdAt || "").trim() || nowIso,
        };

        const db = getAdminDb();

        // Preserve createdAt if doc exists (so edits won't reset it)
        const ref = db.collection("tools").doc(slug);
        const snap = await ref.get();
        if (snap.exists) {
            const existing = snap.data() as any;
            if (existing?.createdAt) tool.createdAt = existing.createdAt;
        }

        await ref.set(tool, { merge: true });

        return NextResponse.json({ ok: true, id: slug });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { error: e?.message || "Server error" },
            { status: 500 }
        );
    }
}

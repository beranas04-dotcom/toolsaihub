import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function isNonEmptyString(v: any, min = 2, max = 2000) {
    return typeof v === "string" && v.trim().length >= min && v.trim().length <= max;
}

function normalizeTags(input: any): string[] {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : String(input).split(",");
    return arr
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 12);
}

function safeHttpUrl(u?: string | null) {
    if (!u) return "";
    try {
        const url = new URL(u);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return "";
    } catch {
        return "";
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));

        // Honeypot (anti-spam): if filled -> ignore
        if (body?.companyWebsite) {
            return NextResponse.json({ ok: true }); // pretend success
        }

        const name = String(body?.name || "").trim();
        const tagline = String(body?.tagline || "").trim();
        const description = String(body?.description || "").trim();
        const category = String(body?.category || "").trim();

        const websiteUrl = safeHttpUrl(body?.websiteUrl || body?.website);
        const affiliateUrl = safeHttpUrl(body?.affiliateUrl);
        const logo = safeHttpUrl(body?.logo || body?.logoUrl);

        const pricing = String(body?.pricing || "").trim();
        const tags = normalizeTags(body?.tags);

        const contactEmail = String(body?.contactEmail || "").trim();
        const notes = String(body?.notes || "").trim();

        // Minimal required validation (public form)
        if (!isNonEmptyString(name, 2, 80)) {
            return NextResponse.json({ error: "Name is required (2-80 chars)." }, { status: 400 });
        }
        if (!isNonEmptyString(tagline, 5, 140)) {
            return NextResponse.json({ error: "Tagline is required (5-140 chars)." }, { status: 400 });
        }
        if (!isNonEmptyString(description, 30, 4000)) {
            return NextResponse.json({ error: "Description is required (min 30 chars)." }, { status: 400 });
        }
        if (!isNonEmptyString(category, 2, 40)) {
            return NextResponse.json({ error: "Category is required." }, { status: 400 });
        }
        if (!websiteUrl && !affiliateUrl) {
            return NextResponse.json(
                { error: "Please provide a valid Website URL (or Affiliate URL)." },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const now = new Date().toISOString();

        const doc = {
            name,
            tagline,
            description,
            category,
            tags,
            pricing: pricing || null,
            websiteUrl: websiteUrl || null,
            affiliateUrl: affiliateUrl || null,
            logo: logo || null,

            // contact (optional)
            contactEmail: contactEmail || null,
            notes: notes || null,

            // workflow
            status: "pending", // pending | approved | rejected
            createdAt: now,
            updatedAt: now,
            source: "public_submit",
        };

        const ref = await db.collection("tool_submissions").add(doc);

        return NextResponse.json({ ok: true, id: ref.id });
    } catch (e: any) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

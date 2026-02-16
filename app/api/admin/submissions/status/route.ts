import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function safeTrim(v: any) {
    return String(v ?? "").trim();
}

function safeLower(v: any) {
    return safeTrim(v).toLowerCase();
}

function isValidHttpUrl(u: string) {
    try {
        const url = new URL(u);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));

        const name = safeTrim(body.name);
        const websiteUrl = safeTrim(body.websiteUrl);
        const tagline = safeTrim(body.tagline);
        const category = safeTrim(body.category);
        const pricing = safeTrim(body.pricing);
        const email = safeLower(body.email);

        const description = safeTrim(body.description);
        const affiliateUrl = safeTrim(body.affiliateUrl);
        const logo = safeTrim(body.logo);
        const tags = Array.isArray(body.tags) ? body.tags.map(safeTrim).filter(Boolean).slice(0, 12) : [];

        if (!name || !websiteUrl || !tagline || !category || !pricing || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (!isValidHttpUrl(websiteUrl)) {
            return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
        }
        if (affiliateUrl && !isValidHttpUrl(affiliateUrl)) {
            return NextResponse.json({ error: "Invalid affiliate URL" }, { status: 400 });
        }
        if (logo && !isValidHttpUrl(logo)) {
            return NextResponse.json({ error: "Invalid logo URL" }, { status: 400 });
        }
        if (!email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        const db = getAdminDb();
        const docRef = db.collection("submissions").doc();

        await docRef.set({
            name,
            websiteUrl,
            tagline,
            description: description || "",
            category,
            pricing,
            email,
            affiliateUrl: affiliateUrl || "",
            logo: logo || "",
            tags,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: "public_submit",
        });

        return NextResponse.json({ ok: true, id: docRef.id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

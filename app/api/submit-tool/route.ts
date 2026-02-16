// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function clean(s: unknown, max = 2000) {
    const v = String(s ?? "").trim();
    return v.length > max ? v.slice(0, max) : v;
}

function toTags(input: unknown) {
    const raw = String(input ?? "");
    // كيدعم: "image audio" و "image,audio"
    return raw
        .split(/[, ]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 12);
}

function isHttpUrl(u: string) {
    try {
        const url = new URL(u);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // ✅ ندعمو جوج naming styles (باش ما نبدلوش front)
        const name = clean(body.name ?? body.toolName, 80);
        const website = clean(body.website ?? body.websiteUrl, 300);
        const tagline = clean(body.tagline, 120);
        const description = clean(body.description, 4000);
        const category = clean(body.category, 40);
        const pricing = clean(body.pricing, 60);
        const email = clean(body.email, 120);

        const affiliateUrl = clean(body.affiliateUrl ?? body.affiliateURL, 300) || null;
        const logo = clean(body.logo ?? body.logoUrl, 300) || null;
        const tags = toTags(body.tags);

        // Basic validation
        if (!name || !website || !tagline || !category || !pricing || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }
        if (!isHttpUrl(website)) {
            return new NextResponse("Invalid website URL", { status: 400 });
        }
        if (affiliateUrl && !isHttpUrl(affiliateUrl)) {
            return new NextResponse("Invalid affiliate URL", { status: 400 });
        }
        if (logo && !isHttpUrl(logo)) {
            return new NextResponse("Invalid logo URL", { status: 400 });
        }

        const adminDb = getAdminDb();

        // Simple rate-limit by IP (best-effort)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const now = Date.now();
        const rlRef = adminDb.collection("rate_limits").doc(`submit_${ip}`);
        const rlSnap = await rlRef.get();
        const last = rlSnap.exists ? Number(rlSnap.data()?.last || 0) : 0;

        // 1 submit كل 20 ثانية
        if (last && now - last < 20_000) {
            return new NextResponse("Too many requests. Try again in a moment.", {
                status: 429,
            });
        }
        await rlRef.set({ last: now }, { merge: true });

        // Save submission
        const doc = await adminDb.collection("tool_submissions").add({
            name,
            website,
            tagline,
            description,
            category,
            pricing,
            email,
            affiliateUrl,
            logo,
            tags,
            status: "pending",
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ ok: true, id: doc.id });
    } catch (e) {
        console.error(e);
        return new NextResponse("Server error", { status: 500 });
    }
}

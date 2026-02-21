// app/api/out/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function safeHttpUrl(u?: string | null) {
    if (!u) return null;
    try {
        const url = new URL(u);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        return null;
    } catch {
        return null;
    }
}

function normalizeId(input: string) {
    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function sha256(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

function getDayKey(d = new Date()) {
    // YYYY-MM-DD
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function addUtmIfMissing(rawUrl: string, toolSlug: string) {
    try {
        const u = new URL(rawUrl);

        // If any utm_* already exists, don't override.
        const hasAnyUtm =
            u.searchParams.has("utm_source") ||
            u.searchParams.has("utm_medium") ||
            u.searchParams.has("utm_campaign");

        if (!hasAnyUtm) {
            u.searchParams.set("utm_source", "aitoolshub");
            u.searchParams.set("utm_medium", "affiliate");
            u.searchParams.set("utm_campaign", toolSlug || "tool");
        }
        return u.toString();
    } catch {
        return rawUrl;
    }
}

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;
    const refParam = (sp.get("ref") || "").trim();

    // collect utm params (from your internal links)
    const utm: Record<string, string> = {};
    for (const [k, v] of sp.entries()) {
        if (k.toLowerCase().startsWith("utm_") && v) utm[k] = v;
    }

    // ✅ legacy: /api/out?url=https://...
    const direct = safeHttpUrl(sp.get("url"));
    if (direct) {
        const res = NextResponse.redirect(direct, { status: 302 });
        res.headers.set("Cache-Control", "no-store");
        return res;
    }

    // ✅ new: /api/out?toolId=... (or ?id=...)
    const toolIdOrSlug = (sp.get("toolId") || sp.get("id") || "").trim();
    if (!toolIdOrSlug) {
        return new NextResponse("Missing toolId (or valid url) parameter", { status: 400 });
    }

    const key = normalizeId(toolIdOrSlug);
    const db = getDb();

    // 1) try doc id = key
    const docRef = db.collection("tools").doc(key);
    const docSnap = await docRef.get();

    let tool: any = docSnap.exists ? docSnap.data() : null;
    let toolDocId = docSnap.exists ? docSnap.id : null;

    // 2) fallback: slug == key
    if (!tool) {
        const q = await db.collection("tools").where("slug", "==", key).limit(1).get();
        if (!q.empty) {
            tool = q.docs[0].data();
            toolDocId = q.docs[0].id;
        }
    }

    if (!tool || !toolDocId) return new NextResponse("Tool not found", { status: 404 });

    const rawTarget =
        safeHttpUrl(tool?.affiliateUrl) ||
        safeHttpUrl(tool?.website) ||
        safeHttpUrl(tool?.websiteUrl);

    if (!rawTarget) return new NextResponse("Tool has no valid website/affiliateUrl", { status: 400 });

    // ✅ Optional: add UTM for better attribution
    const toolSlug = normalizeId(tool?.slug || toolDocId);
    const target = addUtmIfMissing(rawTarget, toolSlug);
    if (!target) return new NextResponse("Tool has no valid website/affiliateUrl", { status: 400 });
    // ✅ Append UTM to the outbound target (so affiliate dashboards can see it)
    // If no utm_* provided, we add a minimal default set.
    let finalTarget = target;

    try {
        const u = new URL(target);

        // default utm if none provided
        if (Object.keys(utm).length === 0) {
            utm.utm_source = "toolsiahub";
            utm.utm_medium = "affiliate";
            utm.utm_campaign = (tool?.slug || toolDocId || "tool").toString();
            if (refParam) utm.utm_content = refParam;
        } else {
            // if utm exists but utm_content missing, add ref
            if (refParam && !u.searchParams.get("utm_content")) {
                u.searchParams.set("utm_content", refParam);
            }
        }

        // set utm params only if not already present in target
        for (const [k, v] of Object.entries(utm)) {
            if (!u.searchParams.get(k)) u.searchParams.set(k, v);
        }

        finalTarget = u.toString();
    } catch {
        // keep original target if URL parsing fails
        finalTarget = target;
    }

    // ✅ Always redirect, even if tracking fails
    try {
        const ua = request.headers.get("user-agent") || "";
        const ref = request.headers.get("referer") || "";

        let refHost: string | null = null;
        try {
            refHost = ref ? new URL(ref).hostname.replace(/^www\./, "") : null;
        } catch {
            refHost = null;
        }

        const day = getDayKey(new Date());
        const statsDocId = `${toolDocId}_${day}`;

        // 1) clicks collection (row per click) - privacy-friendly fields
        await db.collection("clicks").add({
            toolId: toolDocId,
            slug: tool?.slug || toolDocId,
            target: finalTarget,
            refParam: refParam || null, // ✅ our internal source: card/tool_page/...
            utm: Object.keys(utm).length ? utm : null, // ✅ stored for analysis
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: request.headers.get("user-agent") || null,
            ref: request.headers.get("referer") || null,
        });


        // 2) increment tool clicks counter
        await db.collection("tools").doc(toolDocId).set(
            {
                clicks: admin.firestore.FieldValue.increment(1),
                lastClickAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        // 3) daily stats
        await db.collection("tool_click_stats").doc(statsDocId).set(
            {
                toolId: toolDocId,
                day,
                count: admin.firestore.FieldValue.increment(1),
                lastAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
    } catch (e) {
        console.error("click tracking error", e);
        // no throw => redirect still works
    }

    const res = NextResponse.redirect(finalTarget, { status: 302 });

    res.headers.set("Cache-Control", "no-store");
    return res;
}


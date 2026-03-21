import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SponsorPlan, getSponsorPlan } from "@/lib/sponsorship/plans";
import { getSponsorVariantId } from "@/lib/sponsorship/variants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanStr(v: any, max = 1000) {
    const s = String(v ?? "").trim();
    return s.length > max ? s.slice(0, max) : s;
}

function isValidPlan(v: any): v is SponsorPlan {
    return v === "featured" || v === "homepage" || v === "top";
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);

        if (!body) {
            return NextResponse.json({ error: "Invalid body" }, { status: 400 });
        }

        const toolId = cleanStr(body.toolId, 180).toLowerCase();
        const toolName = cleanStr(body.toolName, 180);
        const ownerName = cleanStr(body.ownerName, 180);
        const ownerEmail = cleanStr(body.ownerEmail, 180).toLowerCase();
        const notes = cleanStr(body.notes, 3000);
        const plan = body.plan;

        if (!toolId) {
            return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
        }

        if (!toolName) {
            return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
        }

        if (!ownerName) {
            return NextResponse.json({ error: "Owner name is required" }, { status: 400 });
        }

        if (!ownerEmail || !ownerEmail.includes("@")) {
            return NextResponse.json({ error: "Valid owner email is required" }, { status: 400 });
        }

        if (!isValidPlan(plan)) {
            return NextResponse.json({ error: "Invalid sponsor plan" }, { status: 400 });
        }

        const db = getAdminDb();
        const toolSnap = await db.collection("tools").doc(toolId).get();

        if (!toolSnap.exists) {
            return NextResponse.json(
                { error: "Tool not found. Submit or create the tool first." },
                { status: 404 }
            );
        }

        const p = getSponsorPlan(plan);
        const variantId = getSponsorVariantId(plan);

        const requestId = crypto.randomUUID();

        await db.collection("sponsorship_requests").doc(requestId).set({
            toolId,
            toolName,
            ownerName,
            ownerEmail,
            plan,
            amount: p.price,
            currency: p.currency,
            status: "pending_payment",
            paymentProvider: "lemon",
            notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        const storeId = process.env.LEMON_STORE_ID;
        const apiKey = process.env.LEMON_API_KEY;
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        if (!storeId || !apiKey) {
            return NextResponse.json(
                { error: "Missing Lemon configuration: LEMON_STORE_ID or LEMON_API_KEY" },
                { status: 500 }
            );
        }

        const checkoutRes = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
            method: "POST",
            headers: {
                "Content-Type": "application/vnd.api+json",
                Accept: "application/vnd.api+json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                data: {
                    type: "checkouts",
                    attributes: {
                        checkout_data: {
                            email: ownerEmail,
                            name: ownerName,
                            custom: {
                                sponsorshipRequestId: requestId,
                                toolId,
                                plan,
                            },
                        },
                        checkout_options: {
                            embed: false,
                            media: true,
                            logo: true,
                        },
                        product_options: {
                            enabled_variants: [variantId],
                            redirect_url: `${appUrl.replace(/\/$/, "")}/promote?paid=1`,
                            receipt_link_url: `${appUrl.replace(/\/$/, "")}/promote?paid=1`,
                        },
                    },
                    relationships: {
                        store: {
                            data: {
                                type: "stores",
                                id: String(storeId),
                            },
                        },
                        variant: {
                            data: {
                                type: "variants",
                                id: String(variantId),
                            },
                        },
                    },
                },
            }),
        });

        const checkoutJson = await checkoutRes.json().catch(() => null);

        if (!checkoutRes.ok) {
            console.error("SPONSOR_LEMON_CHECKOUT_ERROR:", checkoutJson);
            return NextResponse.json(
                { error: "Failed to create Lemon checkout" },
                { status: 500 }
            );
        }

        const checkoutUrl =
            checkoutJson?.data?.attributes?.url ||
            checkoutJson?.data?.attributes?.checkout_url;

        if (!checkoutUrl) {
            return NextResponse.json(
                { error: "Missing Lemon checkout URL" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            requestId,
            url: checkoutUrl,
        });
    } catch (err) {
        console.error("SPONSOR_START_ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
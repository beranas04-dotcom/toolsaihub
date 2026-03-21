import { getAdminDb } from "@/lib/firebaseAdmin";
import { getSponsorPlan, SponsorPlan } from "./plans";

export function calculateSponsorUntil(plan: SponsorPlan) {
    const p = getSponsorPlan(plan);

    const now = Date.now();

    const ms = p.durationDays * 24 * 60 * 60 * 1000;

    return new Date(now + ms).toISOString();
}

export async function activateToolSponsorship(
    toolId: string,
    plan: SponsorPlan
) {
    const db = getAdminDb();

    const p = getSponsorPlan(plan);

    const sponsorUntil = calculateSponsorUntil(plan);

    await db.collection("tools").doc(toolId).set(
        {
            sponsored: true,
            sponsorTier: plan,
            sponsorPriority: p.priority,
            sponsorUntil,
            sponsorLabel: "Sponsored",
            updatedAt: Date.now(),
        },
        { merge: true }
    );
}
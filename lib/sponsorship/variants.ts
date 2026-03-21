import { SponsorPlan } from "./plans";

function toNum(v?: string) {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
}

export function getSponsorVariantId(plan: SponsorPlan) {
    const map: Record<SponsorPlan, number> = {
        featured: toNum(process.env.LEMON_SPONSOR_VARIANT_ID_FEATURED),
        homepage: toNum(process.env.LEMON_SPONSOR_VARIANT_ID_HOMEPAGE),
        top: toNum(process.env.LEMON_SPONSOR_VARIANT_ID_TOP),
    };

    const variantId = map[plan];

    if (!variantId) {
        throw new Error(`Missing Lemon variant id for sponsor plan: ${plan}`);
    }

    return variantId;
}
import type { Tool } from "@/types";

function normalize(s?: string) {
    return (s || "").toLowerCase().trim();
}

function pricingType(pricing?: string) {
    const p = normalize(pricing);
    if (!p) return "unknown";
    if (p.includes("free") || p.includes("freemium")) return "freemium";
    if (p.includes("subscription") || p.includes("/mo") || p.includes("per")) return "subscription";
    if (p.includes("paid") || p.includes("$")) return "paid";
    return "other";
}

export function getRelatedTools(current: Tool, all: Tool[], limit = 6): Tool[] {
    const curCat = normalize(current.category);
    const curTags = new Set((current.tags || []).map(normalize).filter(Boolean));
    const curPricing = pricingType(current.pricing);
    const curFreeTrial = Boolean(current.freeTrial);

    return all
        .filter((t) => t.id !== current.id)
        .map((t) => {
            let score = 0;

            const tCat = normalize(t.category);
            if (curCat && tCat && curCat === tCat) score += 5;

            const tTags = (t.tags || []).map(normalize).filter(Boolean);
            const sharedTags = tTags.filter((x) => curTags.has(x));
            score += sharedTags.length * 2;

            if (Boolean(t.freeTrial) === curFreeTrial) score += 1;

            const tPricing = pricingType(t.pricing);
            if (curPricing !== "unknown" && tPricing === curPricing) score += 1;

            return { tool: t, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.tool);
}

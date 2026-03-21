export type SponsorPlan = "featured" | "homepage" | "top";

export const SPONSOR_PLANS = {
    featured: {
        id: "featured",
        name: "Featured Listing",
        price: 29,
        currency: "USD",
        priority: 20,
        durationDays: 14,
    },

    homepage: {
        id: "homepage",
        name: "Homepage Placement",
        price: 79,
        currency: "USD",
        priority: 50,
        durationDays: 21,
    },

    top: {
        id: "top",
        name: "Top Placement",
        price: 149,
        currency: "USD",
        priority: 100,
        durationDays: 30,
    },
} as const;

export function getSponsorPlan(plan: SponsorPlan) {
    return SPONSOR_PLANS[plan];
}
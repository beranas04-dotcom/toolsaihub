export type ToolStatus = "draft" | "published";

export interface Tool {
    id: string;


    // basics
    name: string;
    tagline?: string;
    description?: string;

    // routing/seo
    slug?: string;

    // taxonomy
    category?: string;
    tags?: string[];

    // links
    website?: string;
    affiliateUrl?: string;

    // media
    logo?: string;

    // commercial
    pricing?: string; // keep it string because you use values like "Paid, from $39/mo"
    freeTrial?: boolean;
    pricingDetails?: string;

    // ratings & reviews
    rating?: number; // average rating (e.g., 1-5)
    reviewCount?: number; // total number of reviews

    // curation
    featured?: boolean;
    verified?: boolean;

    // content sections
    features?: string[];
    useCases?: string[];
    pros?: string[];
    cons?: string[];

    // admin / firestore fields (optional)
    status?: ToolStatus;
    createdAt?: string;
    updatedAt?: string;

    // review freshness (optional)
    lastUpdated?: string;
    reviewedBy?: string;
}

export interface Review {
    id: string;
    toolId: string;
    name?: string;
    title?: string;
    rating?: number; // 1..5
    content: string;
    helpful?: number;
    status: "pending" | "approved" | "rejected";
    createdAt?: string;
}

export interface Submission {
    id: string;
    toolName: string;
    websiteUrl: string;
    description?: string;
    category?: string;
    submitterEmail: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: string;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribedAt?: string;
    active?: boolean;
}

export interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    isAdmin: boolean;
}

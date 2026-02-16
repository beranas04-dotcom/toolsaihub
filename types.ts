export type ToolStatus = "draft" | "published" | "rejected" | "pending";

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

    // optional extra media
    screenshots?: string[];

    // commercial
    pricing?: string; // e.g. "Free", "Freemium", "Paid from $20/mo"
    pricingDetails?: string; // long text plans
    freeTrial?: boolean;

    // affiliate meta
    affiliateNetwork?: string;
    affiliateNotes?: string;

    // ratings & reviews
    rating?: number;
    reviewCount?: number;

    // curation
    featured?: boolean;
    verified?: boolean;

    // content sections
    features?: string[];
    useCases?: string[];
    pros?: string[];
    cons?: string[];

    // SEO fields
    metaTitle?: string;
    metaDescription?: string;

    // admin notes
    adminNotes?: string;

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

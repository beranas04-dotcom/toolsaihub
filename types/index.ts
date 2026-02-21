export interface Tool {
    id: string;
    name: string;
    description?: string;
    slug?: string;
    affiliateUrl?: string;
    tagline?: string;
    category?: string;
    website?: string;
    pricing?: string;
    pricingDetails?: string;
    freeTrial?: boolean;
    logo?: string;
    features?: string[];
    tags?: string[];
    featured?: boolean;
    rating?: number;
    reviewCount?: number;
    verified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    status?: 'published' | 'pending' | 'rejected';
    useCases?: string[];
    pros?: string[];
    cons?: string[];
    sponsored?: boolean;         // true only if paid placement
    sponsorActive?: boolean;     // toggle on/off
    sponsorLabel?: string;       // e.g. "Sponsored"
    heroImage?: string;     // background image URL (blurred)
    sponsorUntil?: string;      // ISO date string
    sponsorPriority?: number;   // higher = more priority

}

export interface Review {
    id: string;
    toolId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    helpful: number;
    createdAt: string;
    status: 'approved' | 'pending' | 'rejected';
}

export interface Submission {
    id: string;
    toolName: string;
    website: string;
    category: string;
    description: string;
    submitterEmail: string;
    submitterName: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    notes?: string;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribedAt: string;
    active: boolean;
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string;
    updatedAt?: string;
    coverImage: string;
    tags: string[];
    readingTime: number;
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAdmin: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    toolCount: number;
}

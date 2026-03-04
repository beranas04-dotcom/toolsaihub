export type Product = {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    fileUrl?: string; // عندك كتعني fileId
    createdAt?: number;
};

export type SystemItem = {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    difficulty?: "beginner" | "intermediate" | "advanced";
    revenuePotential?: string; // مثال: "$500–$5k"
    timeToLaunch?: string; // مثال: "7 days"
    createdAt?: number;
};
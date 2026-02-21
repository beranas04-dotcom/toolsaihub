import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(d);
}

export function slugify(text: string): string {
    return (text || "")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function truncate(text: string, maxLength: number): string {
    const t = text || "";
    if (t.length <= maxLength) return t;
    return t.slice(0, maxLength).trim() + "...";
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function getAverageRating(ratings: number[]): number {
    if (!ratings?.length) return 0;
    const sum = ratings.reduce((acc, r) => acc + r, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
}

export function slugifyCategory(category: string): string {
    return (category || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

export function unslugifyCategory(slug: string): string {
    return (slug || "")
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export function titleCaseFromSlug(slug: string): string {
    return unslugifyCategory(slug);
}

import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import type { Tool } from "@/types";

export type CategoryCount = {
    key: string;
    count: number;
};

export async function getCategoryCounts(): Promise<CategoryCount[]> {
    const db = getDb();

    // Small project = OK to aggregate in code during build or revalidate.
    // Ideally use aggregation query if firebase supports it, or cloud function.
    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .get();

    const counts = new Map<string, number>();

    snap.docs.forEach((d) => {
        const t = d.data() as Tool;
        if (!t.category) return;
        const key = t.category.toLowerCase().trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => a.key.localeCompare(b.key));
}

export async function getHomepageCategories() {
    const counts = await getCategoryCounts();

    return counts.map((c) => ({
        ...c,
        title: "", // Filled by UI component
        description: "", // Filled by UI component
        icon: "", // Filled by UI component
    }));
}

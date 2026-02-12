import "server-only";
import { getDb } from "@/lib/firebaseAdmin";
import type { Tool } from "@/types";

export type CategoryCount = {
    key: string;
    count: number;
};

export async function getCategoryCounts(): Promise<CategoryCount[]> {
    const db = getDb();

    // Small project = OK to aggregate in code.
    // Only published tools for public homepage.
    const snap = await db
        .collection("tools")
        .where("status", "==", "published")
        .get();

    const counts = new Map<string, number>();

    snap.docs.forEach((d) => {
        const t = d.data() as Tool;
        const key = String(t.category || "").trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => a.key.localeCompare(b.key));
}

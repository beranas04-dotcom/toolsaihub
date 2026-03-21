import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getAllTools } from "@/lib/toolsRepo";

export type PublicCategory = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order?: number;
    published?: boolean;
    createdAt?: number | string;
    updatedAt?: number | string;
};

function normalize(s?: string) {
    return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
}

function labelFromSlug(slug: string) {
    const s = slug.replace(/-/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function getPublishedCategories(): Promise<PublicCategory[]> {
    const db = getAdminDb();

    try {
        const snap = await db
            .collection("categories")
            .where("published", "==", true)
            .orderBy("order", "asc")
            .get();

        const categories = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
                id: d.id,
                name: String(data?.name || d.id),
                slug: normalize(data?.slug || d.id),
                description: data?.description || "",
                icon: data?.icon || "",
                order: Number(data?.order || 0),
                published: Boolean(data?.published),
                createdAt: data?.createdAt,
                updatedAt: data?.updatedAt,
            };
        });

        if (categories.length > 0) {
            return categories;
        }
    } catch (err) {
        console.error("GET_PUBLISHED_CATEGORIES_ERROR:", err);
    }

    // fallback: build categories from tools collection/repo
    try {
        const tools = await getAllTools();
        const unique = Array.from(
            new Set(
                tools
                    .map((t: any) => normalize(t?.category))
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));

        return unique.map((slug, idx) => ({
            id: slug,
            name: labelFromSlug(slug),
            slug,
            description: "",
            icon: "",
            order: idx,
            published: true,
        }));
    } catch (err) {
        console.error("GET_PUBLISHED_CATEGORIES_FALLBACK_ERROR:", err);
        return [];
    }
}

export function matchesCategory(toolCategory?: string, slugOrName?: string) {
    const a = normalize(toolCategory);
    const b = normalize(slugOrName);
    return a === b;
}
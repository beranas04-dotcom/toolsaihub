import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";

export type SystemAsset = {
    title: string;
    description?: string;
    productId: string;
};

export type SystemDoc = {
    id: string;
    title?: string;
    subtitle?: string;
    summary?: string;
    published?: boolean;
    assets?: SystemAsset[];
    createdAt?: number | string;
    updatedAt?: number | string;
};

function toTitleFromId(id: string) {
    return String(id || "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getSystemBySlug(slug: string): Promise<SystemDoc | null> {
    const db = getAdminDb();

    try {
        const ref = db.collection("systems").doc(slug);
        const snap = await ref.get();

        if (!snap.exists) return null;

        return {
            id: snap.id,
            ...(snap.data() as any),
        } as SystemDoc;
    } catch (err) {
        console.error("GET_SYSTEM_BY_SLUG_ERROR:", err);
        return null;
    }
}

export function getSystemViewModel(system: SystemDoc | null, slug: string) {
    if (!system) {
        return {
            exists: false,
            title: toTitleFromId(slug),
            subtitle: "",
            summary: "",
            assets: [] as SystemAsset[],
        };
    }

    return {
        exists: true,
        title: system.title || toTitleFromId(slug),
        subtitle: system.subtitle || "",
        summary: system.summary || "",
        assets: Array.isArray(system.assets) ? system.assets : [],
    };
}
import "server-only";
import { getAllTools } from "@/lib/toolsRepo";
import { getPublishedCategories } from "@/lib/publicCategories";

export type BestTool = {
    id: string;
    slug?: string;
    name?: string;
    description?: string;
    tagline?: string;
    category?: string;
    pricing?: string;
    featured?: boolean;
    verified?: boolean;
    clicks?: number;
    status?: string;
    sponsorUntil?: string;
    sponsored?: boolean;
    sponsorPriority?: number;
    createdAt?: string | number;
    updatedAt?: string | number;
    logo?: string;
    website?: string;
};

function normalize(s?: string) {
    return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
}

function sponsorActive(t: any) {
    if (String(t?.status || "").toLowerCase() !== "published") return false;
    if (t?.sponsored !== true) return false;

    const until = t?.sponsorUntil;
    if (!until) return true;

    const ms = Date.parse(String(until));
    if (!Number.isFinite(ms)) return false;

    return ms > Date.now();
}

function sponsorPriority(t: any) {
    const n = Number(t?.sponsorPriority || 0);
    return Number.isFinite(n) ? n : 0;
}

export async function getBestTools() {
    const all = (await getAllTools()) as BestTool[];

    return all
        .filter((t: any) => {
            const status = String(t?.status || "published").toLowerCase();
            const publishedFlag = "published" in t ? Boolean((t as any).published) : true;
            return status === "published" && publishedFlag;
        })
        .sort((a: any, b: any) => {
            const as = sponsorActive(a) ? 1 : 0;
            const bs = sponsorActive(b) ? 1 : 0;
            if (bs !== as) return bs - as;

            const ap = sponsorPriority(a);
            const bp = sponsorPriority(b);
            if (bp !== ap) return bp - ap;

            const af = a.featured ? 1 : 0;
            const bf = b.featured ? 1 : 0;
            if (bf !== af) return bf - af;

            const ac = Number(a.clicks || 0);
            const bc = Number(b.clicks || 0);
            if (bc !== ac) return bc - ac;

            const av = a.verified ? 1 : 0;
            const bv = b.verified ? 1 : 0;
            if (bv !== av) return bv - av;

            return String(a?.name || "").localeCompare(String(b?.name || ""));
        });
}

export async function getBestCategories() {
    const published = await getPublishedCategories();
    if (published.length > 0) return published;

    const tools = await getBestTools();
    const unique = Array.from(
        new Set(tools.map((t) => normalize(t.category)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return unique.map((slug, idx) => ({
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
        slug,
        description: "",
        icon: "",
        order: idx,
        published: true,
    }));
}

export function filterBestToolsByCategory(tools: BestTool[], category: string) {
    const c = normalize(category);
    return tools.filter((t) => normalize(t.category) === c);
}
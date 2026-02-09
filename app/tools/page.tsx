import type { Metadata } from "next";
import Link from "next/link";
import ToolsFilters from "@/components/tools/ToolsFilters";
import { getAllTools } from "@/lib/toolsRepo";
import ToolCardPro from "@/components/tools/ToolCardPro";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

function parsePage(v?: string) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.floor(n);
}

function siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function normalizePricing(pricing?: string) {
    const p = (pricing || "").toLowerCase();
    if (!p) return "";
    if (p.includes("free forever") || p === "free") return "free";
    if (p.includes("freemium")) return "freemium";
    if (p.includes("paid") || p.includes("$") || p.includes("pro")) return "paid";
    if (p.includes("subscription")) return "subscription";
    if (p.includes("credits")) return "credits";
    return "";
}

function pickDate(t: any) {
    // newest: prefer updatedAt -> createdAt -> lastUpdated
    const d = t?.updatedAt || t?.createdAt || t?.lastUpdated;
    const ms = Date.parse(d || "");
    return Number.isFinite(ms) ? ms : 0;
}

function buildCanonical(params: {
    page: number;
    category?: string;
    pricing?: string;
    sort?: string;
}) {
    const base = `${siteUrl()}/tools`;
    const qs = new URLSearchParams();

    if (params.category) qs.set("category", params.category);
    if (params.pricing) qs.set("pricing", params.pricing);

    // featured هو default => ما نحطوهش
    if (params.sort && params.sort !== "featured") qs.set("sort", params.sort);

    if (params.page > 1) qs.set("page", String(params.page));

    const s = qs.toString();
    return s ? `${base}?${s}` : base;
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams?: { page?: string; category?: string; pricing?: string; sort?: string };
}): Promise<Metadata> {
    const page = parsePage(searchParams?.page);
    const category = (searchParams?.category || "").trim();
    const pricing = (searchParams?.pricing || "").trim();
    const sort = (searchParams?.sort || "featured").trim() || "featured";

    return {
        alternates: {
            canonical: buildCanonical({
                page,
                category: category || undefined,
                pricing: pricing || undefined,
                sort: sort || undefined,
            }),
        },
    };
}

export default async function ToolsPage({
    searchParams,
}: {
    searchParams?: { page?: string; category?: string; pricing?: string; sort?: string };
}) {
    const page = parsePage(searchParams?.page);
    const categoryFilter = (searchParams?.category || "").trim().toLowerCase();
    const pricingFilter = (searchParams?.pricing || "").trim().toLowerCase();
    const sort = ((searchParams?.sort || "featured").trim() || "featured").toLowerCase();

    const all = await getAllTools();

    const categories = Array.from(
        new Set(all.map((t) => (t.category || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    // filter
    let filtered = all.filter((t) => {
        const catOk = categoryFilter
            ? (t.category || "").trim().toLowerCase() === categoryFilter
            : true;

        const pricingKey = normalizePricing((t as any).pricing);
        const pricingOk = pricingFilter ? pricingKey === pricingFilter : true;

        return catOk && pricingOk;
    });

    // sort
    filtered = filtered.slice().sort((a: any, b: any) => {
        if (sort === "az") {
            return (a.name || "").localeCompare(b.name || "");
        }

        if (sort === "newest") {
            return pickDate(b) - pickDate(a);
        }

        // featured (default): featured first, verified second, then name
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (bf !== af) return bf - af;

        const av = a.verified ? 1 : 0;
        const bv = b.verified ? 1 : 0;
        if (bv !== av) return bv - av;

        return (a.name || "").localeCompare(b.name || "");
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * PER_PAGE;
    const tools = filtered.slice(start, start + PER_PAGE);

    const makeHref = (p: number) => {
        const qs = new URLSearchParams();
        if (categoryFilter) qs.set("category", categoryFilter);
        if (pricingFilter) qs.set("pricing", pricingFilter);
        if (sort && sort !== "featured") qs.set("sort", sort);
        if (p > 1) qs.set("page", String(p));

        const s = qs.toString();
        return s ? `/tools?${s}` : "/tools";
    };

    const sortLabel =
        sort === "az" ? "A → Z" : sort === "newest" ? "Newest" : "Recommended";

    return (
        <main className="container mx-auto px-6 py-10">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tools</h1>
                    <p className="text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{total}</span> tools
                        {categoryFilter ? (
                            <>
                                {" "}
                                in <span className="font-semibold text-foreground">{categoryFilter}</span>
                            </>
                        ) : null}
                        {pricingFilter ? (
                            <>
                                {" "}
                                with <span className="font-semibold text-foreground">{pricingFilter}</span> pricing
                            </>
                        ) : null}
                        . Sorted by <span className="font-semibold text-foreground">{sortLabel}</span>. Page{" "}
                        {safePage} of {totalPages}.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={makeHref(Math.max(1, safePage - 1))}
                        aria-disabled={safePage === 1}
                        className={`px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition ${safePage === 1 ? "pointer-events-none opacity-50" : ""
                            }`}
                    >
                        ← Prev
                    </Link>
                    <Link
                        href={makeHref(Math.min(totalPages, safePage + 1))}
                        aria-disabled={safePage === totalPages}
                        className={`px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition ${safePage === totalPages ? "pointer-events-none opacity-50" : ""
                            }`}
                    >
                        Next →
                    </Link>
                </div>
            </div>

            <ToolsFilters
                categories={categories}
                toolsIndex={all.map((t: any) => ({
                    id: t.id,
                    slug: t.slug,
                    name: t.name,
                    tagline: t.tagline,
                    category: t.category,
                    pricing: t.pricing,
                    tags: t.tags || [],
                }))}
            />


            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((t) => (
                    <ToolCardPro key={t.id} tool={t} />
                ))}
            </div>


            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between gap-4">
                    <Link
                        href={makeHref(Math.max(1, safePage - 1))}
                        aria-disabled={safePage === 1}
                        className={`px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition ${safePage === 1 ? "pointer-events-none opacity-50" : ""
                            }`}
                    >
                        ← Prev
                    </Link>

                    <div className="text-sm text-muted-foreground">
                        Page <span className="text-foreground font-semibold">{safePage}</span> /{" "}
                        <span className="text-foreground font-semibold">{totalPages}</span>
                    </div>

                    <Link
                        href={makeHref(Math.min(totalPages, safePage + 1))}
                        aria-disabled={safePage === totalPages}
                        className={`px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition ${safePage === totalPages ? "pointer-events-none opacity-50" : ""
                            }`}
                    >
                        Next →
                    </Link>
                </div>
            )}
        </main>
    );
}

import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getPublishedCategories, matchesCategory } from "@/lib/publicCategories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ToolDoc = {
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    logo?: string;
    pricing?: string;
    featured?: boolean;
    published?: boolean;
    clicks?: number;
};

function normalize(s?: string) {
    return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
}

export default async function CategoryDetailPage({
    params,
}: {
    params: { category: string };
}) {
    const db = getAdminDb();
    const categorySlug = normalize(params.category);

    const categories = await getPublishedCategories();
    const category = categories.find(
        (c) => normalize(c.slug) === categorySlug || normalize(c.name) === categorySlug
    );

    if (!category) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Category not found</h1>
                <Link href="/categories" className="underline text-muted-foreground hover:text-foreground">
                    Back to categories
                </Link>
            </main>
        );
    }

    let tools: Array<{ id: string } & ToolDoc> = [];

    try {
        const snap = await db.collection("tools").where("published", "==", true).get();

        tools = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as ToolDoc) }))
            .filter((tool) => {
                return (
                    matchesCategory(tool.category, category.slug) ||
                    matchesCategory(tool.category, category.name)
                );
            })
            .sort((a, b) => {
                const fa = a.featured ? 1 : 0;
                const fb = b.featured ? 1 : 0;
                if (fb !== fa) return fb - fa;
                return Number(b.clicks || 0) - Number(a.clicks || 0);
            });
    } catch (err) {
        console.error("CATEGORY_DETAIL_TOOLS_ERROR:", err);
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <section className="mb-10">
                <Link
                    href="/categories"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    ← Back to categories
                </Link>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    {category.icon ? `${category.icon} ` : ""}
                    {category.name}
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    {category.description || "Browse tools in this category."}
                </p>

                <div className="mt-4 text-sm text-muted-foreground">
                    {tools.length} tool{tools.length === 1 ? "" : "s"}
                </div>
            </section>

            {tools.length === 0 ? (
                <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
                    <h2 className="text-xl font-bold">No tools yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        There are no published tools in this category yet.
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/tools/${encodeURIComponent(tool.slug || tool.id)}`}
                            className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="font-extrabold text-lg truncate">
                                        {tool.name || tool.slug || tool.id}
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                        {tool.description || "AI tool"}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    {tool.featured ? (
                                        <span className="text-[11px] px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
                                            FEATURED
                                        </span>
                                    ) : null}

                                    {tool.pricing ? (
                                        <span className="text-[11px] px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">
                                            {tool.pricing}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-6 inline-flex items-center text-sm underline text-muted-foreground hover:text-foreground">
                                View tool →
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getPublishedCategories } from "@/lib/publicCategories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    const db = getAdminDb();
    const categories = await getPublishedCategories();

    let counts: Record<string, number> = {};

    try {
        const toolsSnap = await db
            .collection("tools")
            .where("published", "==", true)
            .get();

        const rawCounts: Record<string, number> = {};

        toolsSnap.docs.forEach((doc) => {
            const data = doc.data() as any;
            const category = String(data?.category || "general")
                .trim()
                .toLowerCase()
                .replace(/[_\s]+/g, "-");

            rawCounts[category] = (rawCounts[category] || 0) + 1;
        });

        counts = rawCounts;
    } catch (err) {
        console.error("CATEGORIES_PAGE_COUNTS_ERROR:", err);
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Explore by category
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Categories
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    Browse AI tools by category and discover the best tools for your workflow.
                </p>
            </section>

            {categories.length === 0 ? (
                <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
                    <h2 className="text-xl font-bold">No categories found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add and publish categories from the admin panel.
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => {
                        const count = counts[cat.slug] || 0;

                        return (
                            <Link
                                key={cat.id}
                                href={`/categories/${encodeURIComponent(cat.slug)}`}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-extrabold">
                                            {cat.icon ? `${cat.icon} ` : ""}
                                            {cat.name}
                                        </h2>

                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                            {cat.description || "Browse tools in this category."}
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                        {count} tool{count === 1 ? "" : "s"}
                                    </span>
                                </div>

                                <div className="mt-6 inline-flex items-center text-sm underline text-muted-foreground hover:text-foreground">
                                    Explore category →
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
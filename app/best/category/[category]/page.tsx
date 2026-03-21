import Link from "next/link";
import ToolCardPro from "@/components/tools/ToolCardPro";
import {
    filterBestToolsByCategory,
    getBestCategories,
    getBestTools,
} from "@/lib/bestTools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalize(s?: string) {
    return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
}

export default async function BestCategoryPage({
    params,
}: {
    params: { category: string };
}) {
    const [tools, categories] = await Promise.all([
        getBestTools(),
        getBestCategories(),
    ]);

    const categorySlug = normalize(params.category);
    const category = categories.find(
        (c: any) => normalize(c.slug) === categorySlug || normalize(c.name) === categorySlug
    );

    if (!category) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-extrabold mb-3">Category not found</h1>
                <Link href="/best" className="underline text-muted-foreground hover:text-foreground">
                    Back to best tools
                </Link>
            </main>
        );
    }

    const filtered = filterBestToolsByCategory(tools, category.slug);

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <section className="mb-10">
                <Link
                    href="/best"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    ← Back to best tools
                </Link>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Best {category.icon ? `${category.icon} ` : ""}
                    {category.name} Tools
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    {category.description || `Top AI tools in the ${category.name} category.`}
                </p>

                <div className="mt-4 text-sm text-muted-foreground">
                    {filtered.length} tool{filtered.length === 1 ? "" : "s"}
                </div>
            </section>

            {filtered.length === 0 ? (
                <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
                    <h2 className="text-xl font-bold">No tools found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        There are no published tools in this category yet.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((tool: any) => (
                        <ToolCardPro key={tool.id} tool={tool} />
                    ))}
                </div>
            )}
        </main>
    );
}
import Link from "next/link";
import ToolCardPro from "@/components/tools/ToolCardPro";
import { getBestCategories, getBestTools } from "@/lib/bestTools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BestPage() {
    const [tools, categories] = await Promise.all([
        getBestTools(),
        getBestCategories(),
    ]);

    const topTools = tools.slice(0, 12);

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Best AI tools
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Best AI Tools
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    Explore top-performing AI tools ranked using featured placement, activity, and popularity.
                </p>
            </section>

            <section className="mb-10">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-2xl font-extrabold">Browse by category</h2>
                        <p className="text-sm text-muted-foreground">
                            Jump directly to the best tools in a specific category.
                        </p>
                    </div>
                </div>

                {categories.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                        No categories available yet.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat: any) => (
                            <Link
                                key={cat.slug}
                                href={`/best/category/${encodeURIComponent(cat.slug)}`}
                                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/30"
                            >
                                {cat.icon ? `${cat.icon} ` : ""}
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-end justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-2xl font-extrabold">Top picks</h2>
                        <p className="text-sm text-muted-foreground">
                            The strongest tools right now across categories.
                        </p>
                    </div>
                    <span className="text-xs rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                        {topTools.length} shown
                    </span>
                </div>

                {topTools.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
                        <h2 className="text-xl font-bold">No tools found</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Publish tools from the admin panel to populate this page.
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topTools.map((tool: any) => (
                            <ToolCardPro key={tool.id} tool={tool} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
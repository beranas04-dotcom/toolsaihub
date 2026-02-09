import type { Metadata } from "next";
import Link from "next/link";
import { getAllTools } from "@/lib/toolsRepo";
import { slugifyCategory } from "@/lib/utils";
import type { Tool } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "AI Tools Categories",
    description:
        "Browse AI tools by category. Discover the best tools for writing, design, marketing, coding, and more.",
};

export default async function CategoriesPage() {
    const tools = (await getAllTools()) as Tool[];

    const categoryMap = tools.reduce<Record<string, number>>((acc, tool) => {
        const cat = (tool.category || "").trim();
        if (!cat) return acc;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.entries(categoryMap).sort((a, b) =>
        a[0].localeCompare(b[0])
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {categories.map(([cat, count]) => {
                    const slug = slugifyCategory(cat);

                    return (
                        <Link
                            key={cat}
                            href={`/categories/${slug}`}
                            className="p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold capitalize">{cat}</h2>
                                <span className="text-sm text-muted-foreground">{count} tools</span>
                            </div>

                            <p className="text-muted-foreground mt-2">
                                View the best AI tools in {cat}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

import Link from "next/link";
import { slugifyCategory } from "@/lib/utils";

export type CategoryCard = {
    key: string;        // ex: "writing"
    title: string;      // ex: "Writing"
    description: string;
    icon: string;       // emoji ok for now
    count: number;
};

const categoryMetadata: Record<string, { icon: string; title: string; description: string }> = {
    writing: { icon: "✍️", title: "Writing", description: "AI copywriting & content tools" },
    images: { icon: "🎨", title: "Images", description: "Image generation & editing" },
    video: { icon: "🎬", title: "Video", description: "Video creation & editing" },
    audio: { icon: "🎵", title: "Audio", description: "Text-to-speech & voice tools" },
    productivity: { icon: "⚡", title: "Productivity", description: "Notes, meetings & automation" },
    code: { icon: "💻", title: "Code", description: "Coding assistants & IDEs" },
    research: { icon: "🔬", title: "Research", description: "Research & answer engines" },
    marketing: { icon: "📈", title: "Marketing", description: "SEO, email & campaigns" },
    utilities: { icon: "🔧", title: "Utilities", description: "Prompts, templates & helpers" },
    "developer-tools": { icon: "🛠️", title: "Developer Tools", description: "Docs, APIs & dev utilities" },
};

function prettifyCategory(raw: string) {
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryGrid({ categories }: { categories: CategoryCard[] }) {
    const normalized = (categories || [])
        .map((c) => {
            const meta = categoryMetadata[c.key];
            return {
                ...c,
                title: c.title || meta?.title || prettifyCategory(c.key),
                icon: c.icon || meta?.icon || "🔹",
                description: c.description || meta?.description || "AI tools and utilities",
            };
        })
        .filter((c) => (c.count ?? 0) > 0)
        .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">Browse by Category</h2>
                    <p className="text-muted-foreground text-lg">Find the perfect AI tool for your needs</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {normalized.map((c) => (
                        <Link
                            key={c.key}
                            href={`/categories/${slugifyCategory(c.key)}`}
                            aria-label={`Browse ${c.title} AI tools`}
                            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</div>

                                <span className="text-xs rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">
                                    {c.count}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                {c.title}
                            </h3>

                            <p className="text-sm text-muted-foreground">{c.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

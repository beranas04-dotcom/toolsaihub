import Link from "next/link";
import { slugifyCategory } from "@/lib/utils";
import toolsData from "@/data/tools.json";
import type { Tool } from "@/types";

type CategoryCard = {
    key: string;
    title: string;
    description: string;
    count: number;
    slug: string;
    image: string; // /categories/{slug}.jpg
};

const categoryMetadata: Record<
    string,
    { title: string; description: string; image?: string }
> = {
    writing: {
        title: "Writing",
        description: "AI copywriting, blogs, and content workflows.",
        image: "/categories/writing.jpg",
    },
    images: {
        title: "Images",
        description: "Generate, edit, and enhance visuals with AI.",
        image: "/categories/images.jpg",
    },
    video: {
        title: "Video",
        description: "Create, edit, and repurpose video content fast.",
        image: "/categories/video.jpg",
    },
    audio: {
        title: "Audio",
        description: "Text-to-speech, voice, dubbing, and audio tools.",
        image: "/categories/audio.jpg",
    },
    productivity: {
        title: "Productivity",
        description: "Automation, meeting notes, and team workflows.",
        image: "/categories/productivity.jpg",
    },
    code: {
        title: "Code",
        description: "Coding assistants, IDE copilots, and dev help.",
        image: "/categories/code.jpg",
    },
    research: {
        title: "Research",
        description: "Answer engines, paper search, and synthesis tools.",
        image: "/categories/research.jpg",
    },
    marketing: {
        title: "Marketing",
        description: "SEO, email campaigns, ads, and growth tooling.",
        image: "/categories/marketing.jpg",
    },
    utilities: {
        title: "Utilities",
        description: "Prompts, templates, and handy AI helpers.",
        image: "/categories/utilities.jpg",
    },
    "developer-tools": {
        title: "Developer Tools",
        description: "Docs, APIs, testing, and dev utilities.",
        image: "/categories/developer-tools.jpg",
    },
};

function prettifyCategory(raw: string) {
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryGrid() {
    const tools = toolsData as Tool[];

    // count tools per category
    const counts = tools.reduce<Record<string, number>>((acc, t) => {
        if (!t.category) return acc;
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
    }, {});

    const uniqueCategories = Array.from(
        new Set(tools.map((t) => t.category).filter((c): c is string => Boolean(c)))
    );

    const categories: CategoryCard[] = uniqueCategories
        .map((key) => {
            const slug = slugifyCategory(key);
            const meta = categoryMetadata[key];
            return {
                key,
                slug,
                title: meta?.title ?? prettifyCategory(key),
                description: meta?.description ?? "Explore the best tools in this category.",
                count: counts[key] ?? 0,
                image: meta?.image ?? `/categories/${slug}.jpg`,
            };
        })
        .filter((c) => c.count > 0)
        .sort((a, b) => a.title.localeCompare(b.title));

    if (!categories.length) return null;

    // Duplicate for seamless infinite loop
    const track = [...categories, ...categories];

    return (
        <section className="py-14 bg-muted/30 border-y border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Top line (conversion copy) */}
                <div className="text-center mb-8">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Freshly curated every week
                    </div>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
                        Explore{" "}
                        <span className="text-primary">{tools.length}</span>{" "}
                        hand-picked AI tools
                    </h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Pick a category to see the best tools, pricing, and top use cases — curated for speed.
                    </p>
                </div>

                {/* Header + controls */}
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-xl font-semibold">Browse by Category</h3>
                        <p className="text-sm text-muted-foreground">
                            Click a category to explore tools.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Scroll left"
                            className="h-9 w-9 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                            onClick={() => {
                                const el = document.getElementById("cat-track");
                                if (!el) return;
                                el.scrollBy({ left: -420, behavior: "smooth" });
                            }}
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            aria-label="Scroll right"
                            className="h-9 w-9 rounded-full border border-border bg-card hover:bg-accent transition grid place-items-center"
                            onClick={() => {
                                const el = document.getElementById("cat-track");
                                if (!el) return;
                                el.scrollBy({ left: 420, behavior: "smooth" });
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>

                {/* Infinite track */}
                <div className="relative">
                    {/* fade edges */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10" />

                    <div
                        id="cat-track"
                        className="overflow-x-auto no-scrollbar scroll-smooth"
                    >
                        <div className="flex gap-5 py-2 w-max">
                            {track.map((c, idx) => (
                                <Link
                                    key={`${c.key}-${idx}`}
                                    href={`/categories/${c.slug}`}
                                    aria-label={`Explore ${c.title} AI tools`}
                                    className="group relative w-[320px] sm:w-[380px] h-[220px] rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition"
                                >
                                    {/* Image */}
                                    <div
                                        className="absolute inset-0 bg-center bg-cover"
                                        style={{ backgroundImage: `url(${c.image})` }}
                                    />
                                    {/* Dark overlay for readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/20" />

                                    {/* Content */}
                                    <div className="relative h-full p-5 flex flex-col justify-between">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-sm font-semibold">
                                                {c.title}
                                            </div>
                                            <div className="text-xs rounded-full border border-border bg-background/40 px-2 py-1 text-muted-foreground">
                                                {c.count} tools
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-[90%]">
                                                {c.description}
                                            </p>

                                            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                                Explore {c.title} <span className="transition-transform group-hover:translate-x-1">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
            </div>
        </section>
    );
}

"use client";

import Link from "next/link";

const categories = [
    {
        name: "Audio",
        slug: "audio",
        image: "/categories/audio.jpg",
        description: "Text-to-speech & voice tools",
    },
    {
        name: "Code",
        slug: "code",
        image: "/categories/code.jpg",
        description: "Coding assistants & IDEs",
    },
    {
        name: "Developer Tools",
        slug: "developer-tools",
        image: "/categories/dev.jpg",
        description: "APIs, dev tools & automation",
    },
    {
        name: "Images",
        slug: "images",
        image: "/categories/images.jpg",
        description: "AI image generation",
    },
    {
        name: "Marketing",
        slug: "marketing",
        image: "/categories/marketing.jpg",
        description: "SEO & growth tools",
    },
    {
        name: "Productivity",
        slug: "productivity",
        image: "/categories/productivity.jpg",
        description: "Automation & workflows",
    },
    {
        name: "Research",
        slug: "research",
        image: "/categories/research.jpg",
        description: "AI research tools",
    },
    {
        name: "Utilities",
        slug: "utilities",
        image: "/categories/utilities.jpg",
        description: "Useful AI helpers",
    },
];

export default function CategoryGrid() {
    const looped = [...categories, ...categories];

    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 mb-10">
                <h2 className="text-3xl font-bold mb-3">
                    Browse by Category
                </h2>
                <p className="text-muted-foreground">
                    Find the perfect AI tool for your needs
                </p>
            </div>

            <div className="relative">
                <div className="flex gap-6 animate-scroll whitespace-nowrap">
                    {looped.map((cat, i) => (
                        <Link
                            key={i}
                            href={`/categories/${cat.slug}`}
                            className="min-w-[320px] h-[180px] relative rounded-xl overflow-hidden group"
                        >
                            {/* IMAGE */}
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />

                            {/* OVERLAY */}
                            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition" />

                            {/* CONTENT */}
                            <div className="absolute bottom-4 left-4 z-10">
                                <h3 className="text-white text-lg font-bold">
                                    {cat.name}
                                </h3>
                                <p className="text-sm text-white/80">
                                    {cat.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

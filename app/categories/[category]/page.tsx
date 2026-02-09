import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import ToolCard from "@/components/tools/ToolCard";
import { siteMetadata } from "@/lib/siteMetadata";
import { slugifyCategory } from "@/lib/utils";
import { getAllTools } from "@/lib/toolsRepo";
import type { Tool } from "@/types";

interface Props {
    params: {
        category: string;
    };
}

// human label from slug (basic)
function unslugifyCategory(slug: string) {
    return slug
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// SEO intro paragraphs for known categories
const categoryIntros: Record<string, string> = {
    writing:
        "Discover powerful AI writing tools that help you create compelling copy, blog posts, and content. From AI copywriting assistants to SEO-optimized content generators, find the perfect tool to enhance your writing workflow and produce high-quality content faster.",
    images:
        "Explore cutting-edge AI image generation and editing tools. Create stunning visuals, concept art, and graphics with advanced AI models like DALL-E, Midjourney, and Stable Diffusion. Perfect for designers, artists, and content creators looking to bring their creative visions to life.",
    video:
        "Transform your video creation process with AI-powered tools. From automated editing to text-to-video generation, discover tools that make professional video production accessible to everyone. Create engaging content for social media, marketing, and training.",
    audio:
        "Elevate your audio content with AI voice generation and text-to-speech tools. Create natural-sounding voiceovers, podcasts, and audio content with studio-quality results. Perfect for content creators, educators, and businesses looking to scale their audio production.",
    productivity:
        "Boost your productivity with AI-powered tools for note-taking, meeting transcription, and workflow automation. Streamline your work processes, capture insights automatically, and focus on what matters most with intelligent productivity assistants.",
    code:
        "Supercharge your development workflow with AI coding assistants. Get intelligent code completion, automated reviews, and powerful search capabilities to write better code faster. From GitHub Copilot alternatives to specialized code review tools.",
    research:
        "Accelerate your research with AI-powered search and analysis tools. Get evidence-based answers, explore academic papers, and discover insights faster than ever. Perfect for researchers, students, and professionals conducting in-depth analysis.",
    marketing:
        "Optimize your marketing campaigns with AI-driven tools. From SEO content planning to email optimization and campaign analytics, discover tools that help you reach and engage your audience effectively while maximizing ROI.",
    utilities:
        "Find essential AI utilities and prompt libraries to enhance your AI workflow. Access curated templates, marketplaces, and tools that make working with AI easier and more efficient. Perfect for power users and AI enthusiasts.",
    "developer-tools":
        "Streamline your development process with AI-powered documentation generators, API tools, and developer utilities. Build better software with intelligent assistance for code documentation, API design, and development workflows.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const tools = (await getAllTools()) as Tool[];
    const filtered = tools.filter(
        (t) => slugifyCategory((t.category || "").trim()) === params.category
    );

    if (filtered.length === 0) return { title: "Category Not Found — AIToolsHub" };

    const categoryName = unslugifyCategory(params.category);

    return {
        title: `${categoryName} AI Tools — AIToolsHub`,
        description: `Browse ${categoryName} AI tools. Compare features, pricing, and use cases.`,
        alternates: {
            canonical: `${siteMetadata.siteUrl.replace(/\/$/, "")}/categories/${params.category}`,
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const tools = (await getAllTools()) as Tool[];
    const filtered = tools.filter(
        (t) => slugifyCategory((t.category || "").trim()) === params.category
    );

    if (filtered.length === 0) notFound();

    const categoryName = unslugifyCategory(params.category);
    const intro =
        categoryIntros[params.category] ||
        `Explore the best ${categoryName} AI tools available today.`;

    const base = siteMetadata.siteUrl.replace(/\/$/, "");

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
            { "@type": "ListItem", position: 2, name: "Categories", item: `${base}/categories` },
            {
                "@type": "ListItem",
                position: 3,
                name: categoryName,
                item: `${base}/categories/${params.category}`,
            },
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb Schema (SEO) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Breadcrumb UI */}
            <nav className="mb-6 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">
                    Home
                </Link>
                {" / "}
                <Link href="/categories" className="hover:text-primary transition-colors">
                    Categories
                </Link>
                {" / "}
                <span className="text-foreground font-medium">{categoryName}</span>
            </nav>

            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4">{categoryName} AI Tools</h1>
                <p className="text-lg text-muted-foreground max-w-3xl">{intro}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted px-3 py-1 rounded-full font-medium">
                        {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
                    </span>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((tool) => (
                    <ToolCard key={tool.id} tool={tool as any} />
                ))}
            </div>

            {/* Back links */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                    href="/categories"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    ← Back to Categories
                </Link>

                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                    Browse all AI tools →
                </Link>
            </div>
        </div>
    );
}

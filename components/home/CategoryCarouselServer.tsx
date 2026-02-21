import CategoryCarousel from "@/components/home/CategoryCarousel";
import { getAllTools } from "@/lib/toolsRepo";
import { slugifyCategory } from "@/lib/utils";

type CategoryCard = {
    key: string;
    title: string;
    description: string;
    count: number;
    slug: string;
    icon: string;
    image: string;
};

function prettifyCategory(raw: string) {
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const categoryMetadata: Record<
    string,
    { icon: string; title: string; description: string; image: string }
> = {
    writing: { icon: "✍️", title: "Writing", description: "Copywriting, blogs, and content workflows", image: "/categories/writing.jpg" },
    images: { icon: "🎨", title: "Images", description: "Generate, edit, and enhance visuals", image: "/categories/images.jpg" },
    video: { icon: "🎬", title: "Video", description: "Create, edit, and repurpose videos", image: "/categories/video.jpg" },
    audio: { icon: "🎵", title: "Audio", description: "Text-to-speech, voice, and sound tools", image: "/categories/audio.jpg" },
    productivity: { icon: "⚡", title: "Productivity", description: "Notes, meetings, automation, and workflows", image: "/categories/productivity.jpg" },
    code: { icon: "💻", title: "Code", description: "Coding assistants, IDEs, and dev copilots", image: "/categories/code.jpg" },
    research: { icon: "🔬", title: "Research", description: "Answer engines and research assistants", image: "/categories/research.jpg" },
    marketing: { icon: "📈", title: "Marketing", description: "SEO, email, ads, and growth tools", image: "/categories/marketing.jpg" },
    utilities: { icon: "🔧", title: "Utilities", description: "Prompts, templates, and helpers", image: "/categories/utilities.jpg" },
    "developer-tools": { icon: "🛠️", title: "Developer Tools", description: "Docs, APIs, testing, and dev utilities", image: "/categories/developer-tools.jpg" },
};

export default async function CategoryCarouselServer() {
    const tools = await getAllTools();

    // count tools per category
    const counts = tools.reduce<Record<string, number>>((acc, t: any) => {
        const c = t?.category;
        if (!c) return acc;
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});

    const unique = Object.keys(counts);

    const cards: CategoryCard[] = unique
        .map((key) => {
            const meta = categoryMetadata[key];
            const title = meta?.title ?? prettifyCategory(key);

            return {
                key,
                title,
                icon: meta?.icon ?? "🔹",
                description: meta?.description ?? "Explore tools in this category",
                image: meta?.image ?? "/categories/default.jpg",
                count: counts[key] ?? 0,
                slug: slugifyCategory(key),
            };
        })
        .filter((c) => c.count > 0)
        .sort((a, b) => a.title.localeCompare(b.title));

    return <CategoryCarousel categories={cards} />;
}

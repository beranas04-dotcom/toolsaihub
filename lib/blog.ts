import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    readingMinutes: number;
    content: string;

    // ✅ NEW
    image?: string;      // e.g. /blog/covers/dalle.jpg
    featured?: boolean;  // true/false
}

function toDateString(d: any): string {
    if (d instanceof Date) return d.toISOString();
    if (typeof d === "string") return d;
    return "";
}

function safeTags(v: any): string[] {
    return Array.isArray(v) ? v.filter(Boolean).map(String) : [];
}

export function getAllPosts(): BlogPost[] {
    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs
        .readdirSync(postsDirectory)
        .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    const posts = fileNames
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx?$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");

            const { data, content } = matter(fileContents);
            const stats = readingTime(content);

            return {
                slug,
                title: String(data.title || "No Title"),
                description: String(data.description || ""),
                date: toDateString(data.date),
                tags: safeTags(data.tags),
                readingMinutes: Math.max(1, Math.round(stats.minutes)),
                content,

                // ✅ NEW
                image: data.image ? String(data.image) : undefined,
                featured: Boolean(data.featured),
            } as BlogPost;
        })
        .sort(
            (a, b) =>
                Date.parse(b.date || "1970-01-01") - Date.parse(a.date || "1970-01-01")
        );

    return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
    const mdPath = path.join(postsDirectory, `${slug}.md`);
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);

    const fullPath = fs.existsSync(mdxPath)
        ? mdxPath
        : fs.existsSync(mdPath)
            ? mdPath
            : null;

    if (!fullPath) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
        slug,
        title: String(data.title || "No Title"),
        description: String(data.description || ""),
        date: toDateString(data.date),
        tags: safeTags(data.tags),
        readingMinutes: Math.max(1, Math.round(stats.minutes)),
        content,

        // ✅ NEW
        image: data.image ? String(data.image) : undefined,
        featured: Boolean(data.featured),
    } as BlogPost;
}
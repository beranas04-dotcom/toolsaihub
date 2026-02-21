import { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/siteMetadata";
import { getAllTopics } from "@/lib/topics";
import { getAllPosts } from "@/lib/blog";
import { getAllTools } from "@/lib/toolsRepo";

function slugifyCategory(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = siteMetadata.siteUrl.replace(/\/$/, "");

    // ✅ GET REAL DATA (Firebase)
    const tools = await getAllTools();
    const posts = getAllPosts();
    const allTopics = getAllTopics();

    // =====================
    // Static Routes
    // =====================
    const staticRoutes = [
        "",
        "/tools",
        "/categories",
        "/blog",
        "/best",
        "/about",
        "/contact",
        "/submit",
        "/disclosure",
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1.0 : 0.8,
    }));

    // =====================
    // Tools Routes (🔥 FIXED)
    // =====================
    const toolRoutes = tools.map((tool: any) => ({
        url: `${siteUrl}/tools/${tool.slug}`, // ⚠️ مهم: slug ماشي id
        lastModified: new Date(
            tool.updatedAt || tool.createdAt || Date.now()
        ),
        changeFrequency: "weekly" as const,
        priority: 0.9, // 🔥 مهم بزاف حيت هادو pages ديال money
    }));

    // =====================
    // Categories
    // =====================
    const categories = Array.from(
        new Set(tools.map((t: any) => t.category).filter(Boolean))
    ) as string[];

    const categoryRoutes = categories.map((category) => ({
        url: `${siteUrl}/categories/${slugifyCategory(category)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // =====================
    // Blog
    // =====================
    const blogRoutes = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // =====================
    // Best Topics
    // =====================
    const bestRoutes = allTopics.map((topic) => ({
        url: `${siteUrl}/best/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
    }));

    // =====================
    // Pagination
    // =====================
    const totalTopics = allTopics.length;
    const limit = 20;
    const totalPages = Math.ceil(totalTopics / limit);

    const pageRoutes: MetadataRoute.Sitemap = [];
    for (let i = 2; i <= totalPages; i++) {
        pageRoutes.push({
            url: `${siteUrl}/best/page/${i}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
        });
    }

    // =====================
    // FINAL
    // =====================
    return [
        ...staticRoutes,
        ...toolRoutes,
        ...categoryRoutes,
        ...blogRoutes,
        ...bestRoutes,
        ...pageRoutes,
    ];
}
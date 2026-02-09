import { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/siteMetadata";
import toolsData from "@/data/tools.json";
import { getAllTopics } from "@/lib/topics";
import { getAllPosts } from "@/lib/blog";

function slugifyCategory(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = siteMetadata.siteUrl.replace(/\/$/, "");

    // Static Routes
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

    // Tool Routes
    const toolRoutes = toolsData.map((tool) => ({
        url: `${siteUrl}/tools/${tool.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // Category Routes (slugified consistently)
    const categories = Array.from(
        new Set(toolsData.map((t) => t.category).filter(Boolean))
    ) as string[];

    const categoryRoutes = categories.map((category) => ({
        url: `${siteUrl}/categories/${slugifyCategory(category)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    // Blog Post Routes
    const posts = getAllPosts();
    const blogRoutes = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Best Topic Routes
    const allTopics = getAllTopics();
    const bestRoutes = allTopics.map((topic) => ({
        url: `${siteUrl}/best/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Pagination Routes
    const totalTopics = allTopics.length;
    const limit = 20;
    const totalPages = Math.ceil(totalTopics / limit);

    const pageRoutes: MetadataRoute.Sitemap = [];
    for (let i = 2; i <= totalPages; i++) {
        pageRoutes.push({
            url: `${siteUrl}/best/page/${i}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        });
    }

    return [
        ...staticRoutes,
        ...toolRoutes,
        ...categoryRoutes,
        ...blogRoutes,
        ...bestRoutes,
        ...pageRoutes,
    ];
}

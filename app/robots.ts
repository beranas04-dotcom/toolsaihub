import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/siteMetadata";

export default function robots(): MetadataRoute.Robots {
    const base = siteMetadata.siteUrl.replace(/\/$/, "");

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/api",
                    "/_next", // 🔥 مهم باش Google ما يديرش index لملفات Next.js
                ],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
    };
}
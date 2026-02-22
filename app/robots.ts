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
                    "/_next",
                    "/private",
                ],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}
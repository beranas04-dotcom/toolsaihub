import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { siteMetadata } from "@/lib/siteMetadata";

export const dynamic = "force-dynamic";

export async function GET() {
    const base = siteMetadata.siteUrl.replace(/\/$/, "");
    const posts = getAllPosts();

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${siteMetadata.siteName} Blog</title>
  <link>${base}/blog</link>
  <description>${siteMetadata.description}</description>
  ${posts
            .map(
                (p) => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${base}/blog/${p.slug}</link>
    <guid>${base}/blog/${p.slug}</guid>
    <pubDate>${p.date ? new Date(p.date).toUTCString() : new Date().toUTCString()}</pubDate>
    <description><![CDATA[${p.description || ""}]]></description>
  </item>`
            )
            .join("")}
</channel>
</rss>`;

    return new NextResponse(rss, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
}
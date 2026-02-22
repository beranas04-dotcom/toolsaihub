export type InternalLink = { keyword: string; url: string };

export const INTERNAL_LINKS: InternalLink[] = [
    { keyword: "Copy.ai", url: "/tools/copy-ai" },
    { keyword: "DALL·E", url: "/tools/dalle-studio" },
    { keyword: "DALL·E Studio", url: "/tools/dalle-studio" },
    { keyword: "Midjourney", url: "/tools/midjourney" },
];

// escape regex special chars
function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace keywords in plain text with markdown links.
 * - Max total links per article (default 6)
 * - Max per keyword (default 2)
 * - Avoid replacing inside existing markdown links [text](url)
 */
export function autoLinkMarkdown(
    markdown: string,
    links: InternalLink[] = INTERNAL_LINKS,
    opts?: { maxLinks?: number; maxPerKeyword?: number }
) {
    const maxLinks = opts?.maxLinks ?? 6;
    const maxPerKeyword = opts?.maxPerKeyword ?? 2;

    let total = 0;
    const used = new Map<string, number>();

    // Protect existing markdown links so we don't double-link
    const protectedLinks: string[] = [];
    const protectedMd = markdown.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => {
        protectedLinks.push(m);
        return `__MDLINK_${protectedLinks.length - 1}__`;
    });

    let out = protectedMd;

    // Longer keywords first (avoid partial matches)
    const sorted = [...links].sort((a, b) => b.keyword.length - a.keyword.length);

    for (const item of sorted) {
        if (total >= maxLinks) break;

        const key = item.keyword;
        const already = used.get(key) ?? 0;
        if (already >= maxPerKeyword) continue;

        const rx = new RegExp(`\\b${escapeRegExp(key)}\\b`, "gi");

        out = out.replace(rx, (match) => {
            if (total >= maxLinks) return match;

            const now = used.get(key) ?? 0;
            if (now >= maxPerKeyword) return match;

            used.set(key, now + 1);
            total += 1;

            return `[${match}](${item.url})`;
        });
    }

    // Restore original markdown links
    out = out.replace(/__MDLINK_(\d+)__/g, (_, i) => protectedLinks[Number(i)]);

    return out;
}
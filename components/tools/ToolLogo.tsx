"use client";

import { useMemo, useState } from "react";

function getDomain(urlOrDomain?: string | null) {
    if (!urlOrDomain) return "";
    const v = String(urlOrDomain).trim();
    if (!v) return "";
    try {
        const u = new URL(v.startsWith("http") ? v : `https://${v}`);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return v.replace(/^www\./, "").split("/")[0];
    }
}

export default function ToolLogo({
    src,
    alt,
    className = "",
    website,
    fallbackSrc = "/logo.svg",
}: {
    src?: string | null;
    alt: string;
    className?: string;
    website?: string | null;
    fallbackSrc?: string;
}) {
    const domain = useMemo(() => getDomain(website || ""), [website]);

    const candidates = useMemo(() => {
        const list: string[] = [];
        if (src && src.trim()) list.push(src.trim());
        if (domain) list.push(`https://logo.clearbit.com/${domain}`);
        if (domain) list.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
        list.push(fallbackSrc);
        return list;
    }, [src, domain, fallbackSrc]);

    const [i, setI] = useState(0);

    return (
        <img
            src={candidates[i]}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setI((x) => (x + 1 < candidates.length ? x + 1 : x))}
        />
    );
}

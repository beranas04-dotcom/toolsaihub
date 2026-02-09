"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

export type ToolLite = {
    id: string;
    slug?: string;
    name: string;
    tagline?: string;
    category?: string;
    pricing?: string;
    tags?: string[];
};

type Props = {
    toolsIndex: ToolLite[];
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    maxResults?: number;
};

export default function ToolSearchBox({
    toolsIndex,
    placeholder = "Search tools (e.g., Canva, Jasper, video...)",
    className = "",
    inputClassName = "",
    maxResults = 8,
}: Props) {
    const router = useRouter();

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);

    const wrapRef = useRef<HTMLDivElement | null>(null);

    const fuse = useMemo(() => {
        return new Fuse(toolsIndex, {
            includeScore: true,
            threshold: 0.35,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
                { name: "name", weight: 0.55 },
                { name: "tagline", weight: 0.2 },
                { name: "category", weight: 0.15 },
                { name: "tags", weight: 0.1 },
            ],
        });
    }, [toolsIndex]);

    const results = useMemo(() => {
        const query = q.trim();
        if (!query) return [];
        return fuse.search(query).slice(0, maxResults).map((r) => r.item);
    }, [q, fuse, maxResults]);

    function goToTool(t: ToolLite) {
        setQ("");
        setOpen(false);
        router.push(`/tools/${t.slug || t.id}`);
    }

    // close dropdown when clicking outside + Esc
    useEffect(() => {
        function onMouseDown(e: MouseEvent) {
            const el = wrapRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) setOpen(false);
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={wrapRef}>
            <input
                value={q}
                onChange={(e) => {
                    const v = e.target.value;
                    setQ(v);
                    setOpen(v.trim().length >= 2);
                }}
                onFocus={() => {
                    if (q.trim().length >= 2) setOpen(true);
                }}
                placeholder={placeholder}
                className={
                    inputClassName ||
                    "w-full px-3 py-2 rounded-xl border border-border bg-background"
                }
            />

            {open && results.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                    <div className="max-h-[320px] overflow-auto">
                        {results.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => goToTool(t)}
                                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition"
                            >
                                <div className="font-semibold">{t.name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                    {(t.tagline || t.category || "").toString()}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-2">
                                    {t.category ? (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                            {t.category}
                                        </span>
                                    ) : null}
                                    {t.pricing ? (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {t.pricing}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                        Click outside or press Esc to close.
                    </div>
                </div>
            )}
        </div>
    );
}

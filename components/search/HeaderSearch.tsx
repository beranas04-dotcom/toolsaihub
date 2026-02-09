"use client";

import { useEffect, useState } from "react";
import ToolSearchBox, { ToolLite } from "@/components/search/ToolSearchBox";

type ApiResp = {
    tools: ToolLite[];
    generatedAt?: string;
};

export default function HeaderSearch() {
    const [toolsIndex, setToolsIndex] = useState<ToolLite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const res = await fetch("/api/search-index", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to load search index");
                const data = (await res.json()) as ApiResp;

                if (!mounted) return;
                setToolsIndex(Array.isArray(data.tools) ? data.tools : []);
            } catch {
                if (!mounted) return;
                setToolsIndex([]);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="w-full max-w-[420px]">
            <ToolSearchBox
                toolsIndex={toolsIndex}
                placeholder={loading ? "Loading search..." : "Search AI tools..."}
                maxResults={8}
                inputClassName="w-full px-3 py-2 rounded-xl border border-border bg-background/60 backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        </div>
    );
}

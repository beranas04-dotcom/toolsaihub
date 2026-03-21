"use client";

import { useEffect, useState } from "react";

type Item = {
    id: string;
    toolId: string;
    toolName?: string;
    ownerEmail?: string;
    plan: string;
    status: string;
    createdAt?: number;
};

export default function SponsorshipsAdmin() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);

        const res = await fetch("/api/admin/sponsorships/list", {
            cache: "no-store",
            credentials: "include",
        });

        const j = await res.json();

        setItems(j.items || []);
        setLoading(false);
    }

    async function approve(id: string) {
        await fetch("/api/admin/sponsorships/approve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        load();
    }

    async function reject(id: string) {
        await fetch("/api/admin/sponsorships/reject", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        load();
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return <p className="text-muted-foreground">Loading...</p>;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="border border-border rounded-xl p-4 flex items-center justify-between"
                >
                    <div>
                        <div className="font-semibold">
                            {item.toolName || item.toolId}
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {item.plan} • {item.ownerEmail}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            {item.status}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => approve(item.id)}
                            className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                        >
                            Approve
                        </button>

                        <button
                            onClick={() => reject(item.id)}
                            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BestPage = {
    id: string;
    slug: string;
    title: string;
    published: boolean;
    updatedAt?: number;
};

export default function AdminBestPages() {
    const [items, setItems] = useState<BestPage[]>([]);
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        const res = await fetch("/api/admin/best-pages", { cache: "no-store" });
        const data = await res.json();
        setItems(data.items || []);
    }

    useEffect(() => { load(); }, []);

    async function create() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/best-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, title }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");
            setSlug(""); setTitle("");
            await load();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Best Pages</h1>

            <div className="border rounded-xl p-4 space-y-3">
                <div className="font-semibold">Create new best page</div>
                <div className="grid md:grid-cols-3 gap-3">
                    <input className="border rounded-lg p-2" placeholder="slug (ai-writing-tools)"
                        value={slug} onChange={(e) => setSlug(e.target.value)} />
                    <input className="border rounded-lg p-2" placeholder="title"
                        value={title} onChange={(e) => setTitle(e.target.value)} />
                    <button
                        className="bg-black text-white rounded-lg px-4 py-2 disabled:opacity-50"
                        disabled={loading}
                        onClick={create}
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 font-semibold bg-gray-50">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-4">Slug</div>
                    <div className="col-span-1">Pub</div>
                    <div className="col-span-2">Action</div>
                </div>

                {items.map((p) => (
                    <div key={p.id} className="grid grid-cols-12 gap-2 p-3 border-t">
                        <div className="col-span-5">{p.title}</div>
                        <div className="col-span-4">/best/{p.slug}</div>
                        <div className="col-span-1">{p.published ? "✅" : "—"}</div>
                        <div className="col-span-2">
                            <Link className="underline" href={`/admin/best-pages/${p.id}`}>Edit</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
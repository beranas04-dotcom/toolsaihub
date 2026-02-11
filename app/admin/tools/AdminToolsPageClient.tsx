"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTools } from "@/lib/firestore";
import { Tool } from "@/types";

export default function AdminToolsPageClient() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function loadTools() {
        try {
            const data = await getTools("all");
            setTools(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTools();
    }, []);

    async function updateStatus(id: string, status: "published" | "rejected") {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/tools/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to update status");

            setTools((prev) => prev.map((t) => (t.id === id ? ({ ...t, status } as any) : t)));
        } catch (e) {
            console.error(e);
            alert("Failed to update tool status. Check Vercel logs.");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">🛠 Admin — Manage Tools</h1>
                <Link
                    href="/admin/tools/new"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                >
                    + Add Tool
                </Link>
            </div>

            {loading ? (
                <p>Loading tools...</p>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-4">Tool</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tools.map((tool) => {
                                const status = (tool.status || "draft") as any;
                                const isPending = status === "pending" || status === "draft";
                                const busy = updatingId === tool.id;

                                return (
                                    <tr key={tool.id} className="border-t border-border">
                                        <td className="p-4 font-medium">{tool.name}</td>
                                        <td className="p-4">{tool.category}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${status === "published"
                                                        ? "bg-green-100 text-green-700"
                                                        : status === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex flex-wrap gap-3 items-center">
                                            <Link href={`/tools/${tool.id}`} className="text-blue-600 hover:underline">
                                                View
                                            </Link>
                                            <Link
                                                href={`/admin/tools/edit/${tool.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                Edit
                                            </Link>

                                            {isPending && (
                                                <>
                                                    <button
                                                        disabled={busy}
                                                        onClick={() => updateStatus(tool.id, "published")}
                                                        className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-60"
                                                    >
                                                        {busy ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        disabled={busy}
                                                        onClick={() => updateStatus(tool.id, "rejected")}
                                                        className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60"
                                                    >
                                                        {busy ? "..." : "Reject"}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {tools.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                        No tools found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

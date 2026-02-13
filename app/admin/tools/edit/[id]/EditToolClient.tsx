"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ToolLike = {
    id: string;
    name?: string;
    tagline?: string;
    description?: string;
    category?: string;
    tags?: string[];
    pricing?: string;
    website?: string;
    affiliateUrl?: string;
    logo?: string;
    featured?: boolean;
    verified?: boolean;
    freeTrial?: boolean;
    status?: "draft" | "published" | "rejected" | "pending";
    slug?: string;
};

const CATEGORIES = [
    "writing",
    "images",
    "video",
    "audio",
    "code",
    "marketing",
    "productivity",
    "research",
    "utilities",
    "developer-tools",
];

export default function EditToolClient({ tool }: { tool: ToolLike }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState<ToolLike>(() => ({
        ...tool,
        tags: Array.isArray(tool.tags) ? tool.tags : [],
    }));

    const tagsText = useMemo(() => (form.tags || []).join(", "), [form.tags]);

    function setField<K extends keyof ToolLike>(key: K, value: ToolLike[K]) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    async function save() {
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags:
                    typeof (form as any).tags === "string"
                        ? String((form as any).tags)
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : form.tags || [],
            };

            const res = await fetch(`/api/admin/tools/${tool.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to save");

            router.refresh();
            alert("Saved ✅");
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Failed");
        } finally {
            setSaving(false);
        }
    }

    async function removeTool() {
        if (!confirm("Delete this tool permanently?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/tools/${tool.id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to delete");

            router.push("/admin/tools");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Failed");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <main className="container mx-auto px-6 py-12 max-w-3xl">
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Tool</h1>
                    <p className="text-sm text-muted-foreground">ID: {tool.id}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            router.push("/admin/tools");
                            router.refresh();
                        }}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-accent"
                    >
                        Back
                    </button>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                        onClick={removeTool}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>

            <div className="space-y-6 bg-card border border-border rounded-2xl p-6">
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                            value={form.name || ""}
                            onChange={(e) => setField("name", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Slug (optional)</label>
                        <input
                            value={form.slug || ""}
                            onChange={(e) => setField("slug", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <select
                            value={form.category || ""}
                            onChange={(e) => setField("category", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                        >
                            <option value="">Select</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <select
                            value={form.status || "draft"}
                            onChange={(e) => setField("status", e.target.value as any)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                        >
                            <option value="draft">draft</option>
                            <option value="pending">pending</option>
                            <option value="published">published</option>
                            <option value="rejected">rejected</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Tagline</label>
                    <input
                        value={form.tagline || ""}
                        onChange={(e) => setField("tagline", e.target.value)}
                        className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        rows={5}
                        value={form.description || ""}
                        onChange={(e) => setField("description", e.target.value)}
                        className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium">Website</label>
                        <input
                            value={form.website || ""}
                            onChange={(e) => setField("website", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Affiliate URL</label>
                        <input
                            value={form.affiliateUrl || ""}
                            onChange={(e) => setField("affiliateUrl", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Pricing</label>
                        <input
                            value={form.pricing || ""}
                            onChange={(e) => setField("pricing", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="Freemium, Paid from $..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Logo URL</label>
                        <input
                            value={form.logo || ""}
                            onChange={(e) => setField("logo", e.target.value)}
                            className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <input
                        value={tagsText}
                        onChange={(e) =>
                            setField(
                                "tags",
                                e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                            )
                        }
                        className="mt-2 w-full px-4 py-2 rounded-lg border border-input bg-background"
                        placeholder="seo, writing, chrome-extension"
                    />
                </div>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!form.featured}
                            onChange={(e) => setField("featured", e.target.checked)}
                        />
                        Featured
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!form.verified}
                            onChange={(e) => setField("verified", e.target.checked)}
                        />
                        Verified
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!form.freeTrial}
                            onChange={(e) => setField("freeTrial", e.target.checked)}
                        />
                        Free Trial
                    </label>
                </div>
            </div>
        </main>
    );
}

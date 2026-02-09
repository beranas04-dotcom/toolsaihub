"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function AdminNewToolPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
    const [tagsText, setTagsText] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [featured, setFeatured] = useState(false);

    const slug = useMemo(() => slugify(name), [name]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Name is required.");
        if (!websiteUrl.trim()) return setError("Website URL is required.");
        if (!category.trim()) return setError("Category is required.");

        setSaving(true);
        try {
            const tags = tagsText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const res = await fetch("/api/admin/tools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    slug,
                    websiteUrl: websiteUrl.trim(),
                    tagline: tagline.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    pricing,
                    tags,
                    status,
                    featured,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to create tool");

            router.push("/admin/tools");
            router.refresh();
        } catch (err: any) {
            setError(err?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">➕ Add New Tool</h1>
                <button
                    onClick={() => router.push("/admin/tools")}
                    className="text-sm underline"
                >
                    Back
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid gap-2">
                    <label className="font-medium">Name *</label>
                    <input
                        className="border border-border rounded-lg px-3 py-2 bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jasper AI"
                    />
                    <p className="text-xs text-muted-foreground">Slug: <span className="font-mono">{slug || "—"}</span></p>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Website URL *</label>
                    <input
                        className="border border-border rounded-lg px-3 py-2 bg-background"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Tagline</label>
                    <input
                        className="border border-border rounded-lg px-3 py-2 bg-background"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Short one-line value proposition"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Description</label>
                    <textarea
                        className="border border-border rounded-lg px-3 py-2 bg-background min-h-[120px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this tool do? Who is it for?"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="font-medium">Category *</label>
                        <input
                            className="border border-border rounded-lg px-3 py-2 bg-background"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Writing"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium">Pricing</label>
                        <select
                            className="border border-border rounded-lg px-3 py-2 bg-background"
                            value={pricing}
                            onChange={(e) => setPricing(e.target.value as any)}
                        >
                            <option value="free">Free</option>
                            <option value="freemium">Freemium</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="font-medium">Status</label>
                        <select
                            className="border border-border rounded-lg px-3 py-2 bg-background"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium">Featured</label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                            />
                            Show on homepage
                        </label>
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Tags (comma-separated)</label>
                    <input
                        className="border border-border rounded-lg px-3 py-2 bg-background"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="e.g. copywriting, seo, marketing"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Create Tool"}
                </button>
            </form>
        </div>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type ProductRow = {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    tier?: "free" | "pro";
    published?: boolean;
    fileUrl?: string;
    coverImage?: string | null;
    tags?: string[];
    createdAt?: number;
    updatedAt?: number;
};

function toLabel(s?: string) {
    if (!s) return "General";
    const x = s.replace(/[-_]/g, " ").trim();
    return x.charAt(0).toUpperCase() + x.slice(1);
}

export default function ProductsAdmin() {
    const [items, setItems] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [editing, setEditing] = useState<ProductRow | null>(null);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((p) => {
            const hay = `${p.title || ""} ${p.category || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q]);

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products/list", {
                cache: "no-store",
                credentials: "include",
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Failed to load products");
            setItems(Array.isArray(j?.items) ? j.items : []);
        } catch (e: any) {
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }

    async function togglePublish(p: ProductRow) {
        const next = !p.published;

        // optimistic
        setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: next } : x)));

        try {
            const res = await fetch("/api/admin/products/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: p.id, published: next }),
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Update failed");
        } catch (e: any) {
            // rollback
            setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: p.published } : x)));
            alert(e?.message || "Update failed");
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title, category, tag…"
                    className="w-full md:max-w-sm rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                />

                <div className="flex gap-2">
                    <button
                        onClick={load}
                        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted/30"
                    >
                        Refresh
                    </button>
                    <a
                        href="/admin/products/new"
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                    >
                        + New
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
            ) : err ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {err}
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                            <tr>
                                <th className="py-3 pr-3">Title</th>
                                <th className="py-3 pr-3">Category</th>
                                <th className="py-3 pr-3">Tier</th>
                                <th className="py-3 pr-3">Published</th>
                                <th className="py-3 pr-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} className="border-t border-border/60">
                                    <td className="py-3 pr-3">
                                        <div className="font-semibold">{p.title || "(untitled)"}</div>
                                        <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[520px]">
                                            Drive fileId: <span className="font-semibold">{p.fileUrl || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-3">{toLabel(p.category)}</td>
                                    <td className="py-3 pr-3">
                                        <span
                                            className={[
                                                "text-[11px] px-2 py-1 rounded-full border",
                                                p.tier === "free"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                                    : "border-primary/30 bg-primary/10 text-primary",
                                            ].join(" ")}
                                        >
                                            {(p.tier || "pro").toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-3">
                                        <button
                                            onClick={() => togglePublish(p)}
                                            className={[
                                                "text-xs rounded-full border px-3 py-1 font-semibold",
                                                p.published
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                                    : "border-border/60 bg-background/40 text-muted-foreground",
                                            ].join(" ")}
                                        >
                                            {p.published ? "Published" : "Hidden"}
                                        </button>
                                    </td>
                                    <td className="py-3 pr-3">
                                        <button
                                            onClick={() => setEditing(p)}
                                            className="text-sm underline text-muted-foreground hover:text-foreground"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 ? (
                                <tr>
                                    <td className="py-6 text-muted-foreground" colSpan={5}>
                                        No products found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}

            {editing ? (
                <EditModal
                    p={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            ) : null}
        </div>
    );
}

function EditModal({
    p,
    onClose,
    onSaved,
}: {
    p: ProductRow;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [title, setTitle] = useState(p.title || "");
    const [description, setDescription] = useState(p.description || "");
    const [category, setCategory] = useState(p.category || "general");
    const [tier, setTier] = useState<"free" | "pro">((p.tier as any) || "pro");
    const [fileUrl, setFileUrl] = useState(p.fileUrl || "");
    const [coverImage, setCoverImage] = useState(p.coverImage || "");
    const [tags, setTags] = useState(Array.isArray(p.tags) ? p.tags.join(", ") : "");
    const [published, setPublished] = useState(Boolean(p.published));

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function save() {
        setErr(null);
        setSaving(true);
        try {
            const res = await fetch("/api/admin/products/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: p.id,
                    title,
                    description,
                    category,
                    tier,
                    fileUrl,
                    coverImage,
                    tags,
                    published,
                }),
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Save failed");
            onSaved();
        } catch (e: any) {
            setErr(e?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-3xl border border-border/60 bg-background/80 backdrop-blur p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">Edit product</div>
                        <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                    </div>
                    <button onClick={onClose} className="text-sm underline text-muted-foreground hover:text-foreground">
                        Close
                    </button>
                </div>

                <div className="mt-5 grid gap-4">
                    <Field label="Title">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            className="w-full min-h-[110px] rounded-2xl border border-border bg-background px-4 py-3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Category">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Field>

                        <Field label="Tier">
                            <select
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={tier}
                                onChange={(e) => setTier(e.target.value as any)}
                            >
                                <option value="pro">Pro</option>
                                <option value="free">Free</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Drive fileId (fileUrl)">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            Share the Drive file with your service account email (Viewer).
                        </p>
                    </Field>

                    <Field label="Cover image URL">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                        />
                    </Field>

                    <Field label="Tags (comma separated)">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </Field>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                        Published
                    </label>

                    {err ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {err}
                        </div>
                    ) : null}

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={onClose}
                            className="rounded-2xl border border-border bg-background px-4 py-2.5 font-semibold hover:bg-muted/30"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-sm font-semibold mb-2">{label}</div>
            {children}
        </div>
    );
}
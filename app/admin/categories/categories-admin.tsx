"use client";

import { useEffect, useMemo, useState } from "react";

type CategoryRow = {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    order?: number;
    published?: boolean;
    createdAt?: number | string;
    updatedAt?: number | string;
};

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function formatDate(v?: number | string) {
    if (!v) return "-";
    const d = typeof v === "number" ? new Date(v) : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

export default function CategoriesAdmin() {
    const [items, setItems] = useState<CategoryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [editing, setEditing] = useState<CategoryRow | null>(null);

    const [createName, setCreateName] = useState("");
    const [createSlug, setCreateSlug] = useState("");
    const [createDescription, setCreateDescription] = useState("");
    const [createIcon, setCreateIcon] = useState("");
    const [createOrder, setCreateOrder] = useState("0");
    const [createPublished, setCreatePublished] = useState(true);
    const [createErr, setCreateErr] = useState<string | null>(null);
    const [createLoading, setCreateLoading] = useState(false);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((c) => {
            const hay = `${c.name || ""} ${c.slug || ""} ${c.description || ""}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q]);

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories/list", {
                cache: "no-store",
                credentials: "include",
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Failed to load categories");
            setItems(Array.isArray(j?.items) ? j.items : []);
        } catch (e: any) {
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }

    async function createCategory() {
        setCreateErr(null);

        const name = createName.trim();
        const slug = slugify(createSlug || createName);

        if (!name) return setCreateErr("Name is required.");
        if (!slug) return setCreateErr("Slug is required.");

        setCreateLoading(true);
        try {
            const res = await fetch("/api/admin/categories/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: slug,
                    name,
                    slug,
                    description: createDescription,
                    icon: createIcon,
                    order: Number(createOrder || 0),
                    published: createPublished,
                }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Create failed");

            setCreateName("");
            setCreateSlug("");
            setCreateDescription("");
            setCreateIcon("");
            setCreateOrder("0");
            setCreatePublished(true);
            await load();
        } catch (e: any) {
            setCreateErr(e?.message || "Create failed");
        } finally {
            setCreateLoading(false);
        }
    }

    async function quickTogglePublished(c: CategoryRow) {
        setBusyId(c.id);
        setItems((prev) =>
            prev.map((x) => (x.id === c.id ? { ...x, published: !x.published } : x))
        );

        try {
            const res = await fetch("/api/admin/categories/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: c.id,
                    published: !c.published,
                }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Update failed");
        } catch (e: any) {
            alert(e?.message || "Update failed");
            await load();
        } finally {
            setBusyId(null);
        }
    }

    async function deleteCategory(id: string) {
        const yes = window.confirm("Are you sure you want to delete this category?");
        if (!yes) return;

        setBusyId(id);
        try {
            const res = await fetch("/api/admin/categories/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Delete failed");

            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            alert(e?.message || "Delete failed");
        } finally {
            setBusyId(null);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            {/* Create */}
            <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                <h2 className="text-xl font-extrabold">New Category</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add a new category for tools, filters, and best pages.
                </p>

                <div className="mt-5 grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Name *">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={createName}
                                onChange={(e) => {
                                    setCreateName(e.target.value);
                                    if (!createSlug) setCreateSlug(slugify(e.target.value));
                                }}
                                placeholder="e.g. Writing"
                            />
                        </Field>

                        <Field label="Slug *">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={createSlug}
                                onChange={(e) => setCreateSlug(slugify(e.target.value))}
                                placeholder="e.g. writing"
                            />
                        </Field>
                    </div>

                    <Field label="Description">
                        <textarea
                            className="w-full min-h-[110px] rounded-2xl border border-border bg-background px-4 py-3"
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                            placeholder="Short category description"
                        />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Icon (optional)">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={createIcon}
                                onChange={(e) => setCreateIcon(e.target.value)}
                                placeholder="e.g. ✍️ or pencil"
                            />
                        </Field>

                        <Field label="Order">
                            <input
                                type="number"
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={createOrder}
                                onChange={(e) => setCreateOrder(e.target.value)}
                            />
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={createPublished}
                            onChange={(e) => setCreatePublished(e.target.checked)}
                        />
                        Published
                    </label>

                    {createErr ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {createErr}
                        </div>
                    ) : null}

                    <div className="flex justify-end">
                        <button
                            onClick={createCategory}
                            disabled={createLoading}
                            className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                        >
                            {createLoading ? "Saving…" : "Create Category"}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full md:max-w-sm rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />

                    <button
                        onClick={load}
                        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted/30"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 text-sm text-muted-foreground">Loading categories…</div>
                ) : err ? (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {err}
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-muted-foreground">
                                <tr>
                                    <th className="py-3 pr-3">Category</th>
                                    <th className="py-3 pr-3">Slug</th>
                                    <th className="py-3 pr-3">Order</th>
                                    <th className="py-3 pr-3">Published</th>
                                    <th className="py-3 pr-3">Updated</th>
                                    <th className="py-3 pr-3">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id} className="border-t border-border/60">
                                        <td className="py-3 pr-3">
                                            <div className="font-semibold">
                                                {c.icon ? `${c.icon} ` : ""}
                                                {c.name || c.id}
                                            </div>
                                            {c.description ? (
                                                <div className="mt-1 text-xs text-muted-foreground max-w-[320px] truncate">
                                                    {c.description}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="py-3 pr-3">{c.slug || c.id}</td>
                                        <td className="py-3 pr-3">{c.order ?? 0}</td>

                                        <td className="py-3 pr-3">
                                            <button
                                                onClick={() => quickTogglePublished(c)}
                                                disabled={busyId === c.id}
                                                className={[
                                                    "text-xs rounded-full border px-3 py-1 font-semibold",
                                                    c.published
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                                        : "border-border/60 bg-background/40 text-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {c.published ? "Published" : "Hidden"}
                                            </button>
                                        </td>

                                        <td className="py-3 pr-3 text-muted-foreground">
                                            {formatDate(c.updatedAt || c.createdAt)}
                                        </td>

                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setEditing(c)}
                                                    className="text-left text-sm underline text-muted-foreground hover:text-foreground"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteCategory(c.id)}
                                                    disabled={busyId === c.id}
                                                    className="text-left text-sm underline text-red-400 hover:text-red-300 disabled:opacity-60"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 ? (
                                    <tr>
                                        <td className="py-6 text-muted-foreground" colSpan={6}>
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editing ? (
                <EditCategoryModal
                    category={editing}
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

function EditCategoryModal({
    category,
    onClose,
    onSaved,
}: {
    category: CategoryRow;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(category.name || "");
    const [slug, setSlug] = useState(category.slug || category.id);
    const [description, setDescription] = useState(category.description || "");
    const [icon, setIcon] = useState(category.icon || "");
    const [order, setOrder] = useState(String(category.order ?? 0));
    const [published, setPublished] = useState(Boolean(category.published));

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function save() {
        setErr(null);
        setSaving(true);

        try {
            const res = await fetch("/api/admin/categories/upsert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: category.id,
                    name,
                    slug: slugify(slug),
                    description,
                    icon,
                    order: Number(order || 0),
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

            <div className="relative w-full max-w-2xl rounded-3xl border border-border/60 bg-background/90 backdrop-blur p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">Edit Category</div>
                        <div className="text-xs text-muted-foreground">Doc ID: {category.id}</div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-5 grid gap-4">
                    <Field label="Name">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Field>

                    <Field label="Slug">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
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
                        <Field label="Icon">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                            />
                        </Field>

                        <Field label="Order">
                            <input
                                type="number"
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                            />
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
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

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="text-sm font-semibold mb-2">{label}</div>
            {children}
        </div>
    );
}
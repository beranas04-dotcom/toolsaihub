"use client";

import { useEffect, useMemo, useState } from "react";

type SponsorTier = "none" | "featured" | "homepage" | "top";

type ToolRow = {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    website?: string;
    logo?: string;
    pricing?: string;
    affiliateUrl?: string | null;
    affiliateNetwork?: string | null;
    featured?: boolean;
    published?: boolean;
    clicks?: number;
    sponsored?: boolean;
    sponsorTier?: SponsorTier;
    sponsorPriority?: number;
    sponsorUntil?: string | null;
    sponsorLabel?: string | null;
    createdAt?: number | string;
    updatedAt?: number | string;
};

type FilterMode = "all" | "published" | "hidden" | "featured" | "sponsored";

function formatDate(v?: number | string | null) {
    if (!v) return "-";
    const d = typeof v === "number" ? new Date(v) : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

function toDatetimeLocalInput(v?: string | null) {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${mins}`;
}

function fromDatetimeLocalInput(v: string) {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

function isSponsorActive(tool: ToolRow) {
    if (!tool.sponsored) return false;
    if (!tool.sponsorUntil) return true;
    const ms = Date.parse(String(tool.sponsorUntil));
    if (!Number.isFinite(ms)) return false;
    return ms > Date.now();
}

export default function ToolsAdmin() {
    const [items, setItems] = useState<ToolRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<FilterMode>("all");
    const [editing, setEditing] = useState<ToolRow | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let list = [...items];

        if (filter === "published") list = list.filter((x) => x.published);
        if (filter === "hidden") list = list.filter((x) => !x.published);
        if (filter === "featured") list = list.filter((x) => x.featured);
        if (filter === "sponsored") list = list.filter((x) => isSponsorActive(x));

        const s = q.trim().toLowerCase();
        if (!s) return list;

        return list.filter((t) => {
            const hay =
                `${t.name || ""} ${t.slug || ""} ${t.category || ""} ${t.pricing || ""} ${t.affiliateNetwork || ""} ${t.sponsorTier || ""}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q, filter]);

    async function load() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tools/list", {
                cache: "no-store",
                credentials: "include",
            });
            const j = await res.json().catch(() => null);
            if (!res.ok) throw new Error(j?.error || "Failed to load tools");
            setItems(Array.isArray(j?.items) ? j.items : []);
        } catch (e: any) {
            setErr(e?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }

    async function quickUpdate(id: string, patch: Partial<ToolRow>) {
        setBusyId(id);

        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

        try {
            const res = await fetch("/api/admin/tools/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id, ...patch }),
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

    async function deleteTool(id: string) {
        const yes = window.confirm("Are you sure you want to delete this tool?");
        if (!yes) return;

        setBusyId(id);
        try {
            const res = await fetch("/api/admin/tools/delete", {
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
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name, slug, category, pricing..."
                        className="w-full md:w-[320px] rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterMode)}
                        className="rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="hidden">Hidden</option>
                        <option value="featured">Featured</option>
                        <option value="sponsored">Sponsored</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={load}
                        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted/30"
                    >
                        Refresh
                    </button>

                    <a
                        href="/admin/tools/new"
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                    >
                        + New Tool
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="mt-6 text-sm text-muted-foreground">Loading tools…</div>
            ) : err ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {err}
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                            <tr>
                                <th className="py-3 pr-3">Tool</th>
                                <th className="py-3 pr-3">Category</th>
                                <th className="py-3 pr-3">Clicks</th>
                                <th className="py-3 pr-3">Published</th>
                                <th className="py-3 pr-3">Featured</th>
                                <th className="py-3 pr-3">Sponsored</th>
                                <th className="py-3 pr-3">Updated</th>
                                <th className="py-3 pr-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((t) => {
                                const sponsorActive = isSponsorActive(t);

                                return (
                                    <tr key={t.id} className="border-t border-border/60 align-top">
                                        <td className="py-3 pr-3">
                                            <div className="font-semibold">{t.name || "(no name)"}</div>
                                            <div className="text-xs text-muted-foreground">slug: {t.slug || "-"}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[340px]">
                                                {t.website || ""}
                                            </div>

                                            {t.affiliateUrl ? (
                                                <div className="mt-1 text-xs text-primary truncate max-w-[340px]">
                                                    affiliate: {t.affiliateUrl}
                                                </div>
                                            ) : null}

                                            {t.sponsored ? (
                                                <div className="mt-1 text-xs text-amber-500">
                                                    {t.sponsorLabel || "Sponsored"} • {t.sponsorTier || "featured"} • priority {Number(t.sponsorPriority || 0)}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="py-3 pr-3">
                                            <div>{t.category || "general"}</div>
                                            {t.pricing ? (
                                                <div className="mt-1 text-xs text-muted-foreground">{t.pricing}</div>
                                            ) : null}
                                            {t.affiliateNetwork ? (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {t.affiliateNetwork}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="py-3 pr-3 font-semibold">{t.clicks || 0}</td>

                                        <td className="py-3 pr-3">
                                            <button
                                                onClick={() => quickUpdate(t.id, { published: !t.published })}
                                                disabled={busyId === t.id}
                                                className={[
                                                    "text-xs rounded-full border px-3 py-1 font-semibold",
                                                    t.published
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                                        : "border-border/60 bg-background/40 text-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {t.published ? "Published" : "Hidden"}
                                            </button>
                                        </td>

                                        <td className="py-3 pr-3">
                                            <button
                                                onClick={() => quickUpdate(t.id, { featured: !t.featured })}
                                                disabled={busyId === t.id}
                                                className={[
                                                    "text-xs rounded-full border px-3 py-1 font-semibold",
                                                    t.featured
                                                        ? "border-primary/30 bg-primary/10 text-primary"
                                                        : "border-border/60 bg-background/40 text-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {t.featured ? "Featured" : "Normal"}
                                            </button>
                                        </td>

                                        <td className="py-3 pr-3">
                                            <button
                                                onClick={() =>
                                                    quickUpdate(t.id, {
                                                        sponsored: !t.sponsored,
                                                        sponsorTier: !t.sponsored ? (t.sponsorTier || "featured") : "none",
                                                        sponsorLabel: !t.sponsored ? (t.sponsorLabel || "Sponsored") : null,
                                                        sponsorPriority: !t.sponsored ? Number(t.sponsorPriority || 20) : 0,
                                                    })
                                                }
                                                disabled={busyId === t.id}
                                                className={[
                                                    "text-xs rounded-full border px-3 py-1 font-semibold",
                                                    sponsorActive
                                                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                                                        : "border-border/60 bg-background/40 text-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {sponsorActive ? "Sponsored" : "Normal"}
                                            </button>

                                            {t.sponsorUntil ? (
                                                <div className="mt-1 text-[11px] text-muted-foreground">
                                                    until {formatDate(t.sponsorUntil)}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className="py-3 pr-3 text-muted-foreground">
                                            {formatDate(t.updatedAt || t.createdAt)}
                                        </td>

                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setEditing(t)}
                                                    className="text-left text-sm underline text-muted-foreground hover:text-foreground"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteTool(t.id)}
                                                    disabled={busyId === t.id}
                                                    className="text-left text-sm underline text-red-400 hover:text-red-300 disabled:opacity-60"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 ? (
                                <tr>
                                    <td className="py-6 text-muted-foreground" colSpan={8}>
                                        No tools found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}

            {editing ? (
                <EditToolModal
                    tool={editing}
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

function EditToolModal({
    tool,
    onClose,
    onSaved,
}: {
    tool: ToolRow;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(tool.name || "");
    const [slug, setSlug] = useState(tool.slug || tool.id || "");
    const [description, setDescription] = useState(tool.description || "");
    const [category, setCategory] = useState(tool.category || "general");
    const [website, setWebsite] = useState(tool.website || "");
    const [logo, setLogo] = useState(tool.logo || "");
    const [pricing, setPricing] = useState(tool.pricing || "");
    const [affiliateUrl, setAffiliateUrl] = useState(tool.affiliateUrl || "");
    const [affiliateNetwork, setAffiliateNetwork] = useState(tool.affiliateNetwork || "");
    const [published, setPublished] = useState(Boolean(tool.published));
    const [featured, setFeatured] = useState(Boolean(tool.featured));

    const [sponsored, setSponsored] = useState(Boolean(tool.sponsored));
    const [sponsorTier, setSponsorTier] = useState<SponsorTier>(tool.sponsorTier || "none");
    const [sponsorPriority, setSponsorPriority] = useState(String(Number(tool.sponsorPriority || 0)));
    const [sponsorUntil, setSponsorUntil] = useState(toDatetimeLocalInput(tool.sponsorUntil || ""));
    const [sponsorLabel, setSponsorLabel] = useState(tool.sponsorLabel || "Sponsored");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function save() {
        setErr(null);
        setSaving(true);

        try {
            const res = await fetch("/api/admin/tools/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: tool.id,
                    name,
                    slug,
                    description,
                    category,
                    website,
                    logo,
                    pricing,
                    affiliateUrl,
                    affiliateNetwork,
                    published,
                    featured,
                    sponsored,
                    sponsorTier: sponsored ? sponsorTier : "none",
                    sponsorPriority: sponsored ? Number(sponsorPriority || 0) : 0,
                    sponsorUntil: sponsored ? fromDatetimeLocalInput(sponsorUntil) : null,
                    sponsorLabel: sponsored ? sponsorLabel : null,
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

            <div className="relative w-full max-w-3xl rounded-3xl border border-border/60 bg-background/90 backdrop-blur p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">Edit Tool</div>
                        <div className="text-xs text-muted-foreground">Doc ID: {tool.id}</div>
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

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Slug">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                            />
                        </Field>

                        <Field label="Category">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Field>
                    </div>

                    <Field label="Description">
                        <textarea
                            className="w-full min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Website URL">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </Field>

                        <Field label="Logo URL">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Pricing">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={pricing}
                                onChange={(e) => setPricing(e.target.value)}
                            />
                        </Field>

                        <Field label="Affiliate Network">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={affiliateNetwork}
                                onChange={(e) => setAffiliateNetwork(e.target.value)}
                            />
                        </Field>
                    </div>

                    <Field label="Affiliate URL">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={affiliateUrl}
                            onChange={(e) => setAffiliateUrl(e.target.value)}
                        />
                    </Field>

                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={published}
                                onChange={(e) => setPublished(e.target.checked)}
                            />
                            Published
                        </label>

                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                            />
                            Featured
                        </label>

                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={sponsored}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSponsored(checked);
                                    if (checked && sponsorTier === "none") setSponsorTier("featured");
                                }}
                            />
                            Sponsored
                        </label>
                    </div>

                    {sponsored ? (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Sponsor Tier">
                                    <select
                                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                        value={sponsorTier}
                                        onChange={(e) => setSponsorTier(e.target.value as SponsorTier)}
                                    >
                                        <option value="featured">featured</option>
                                        <option value="homepage">homepage</option>
                                        <option value="top">top</option>
                                        <option value="none">none</option>
                                    </select>
                                </Field>

                                <Field label="Sponsor Priority">
                                    <input
                                        type="number"
                                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                        value={sponsorPriority}
                                        onChange={(e) => setSponsorPriority(e.target.value)}
                                    />
                                </Field>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Sponsor Until">
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                        value={sponsorUntil}
                                        onChange={(e) => setSponsorUntil(e.target.value)}
                                    />
                                </Field>

                                <Field label="Sponsor Label">
                                    <input
                                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                        value={sponsorLabel}
                                        onChange={(e) => setSponsorLabel(e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    ) : null}

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
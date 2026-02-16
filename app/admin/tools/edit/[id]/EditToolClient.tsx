"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

type ToolLike = {
    id: string;
    name?: string;
    slug?: string;

    tagline?: string;
    description?: string;

    category?: string;
    tags?: string[];

    website?: string;
    affiliateUrl?: string;
    affiliateNetwork?: string;
    affiliateNotes?: string;

    logo?: string;
    screenshots?: string[];

    pricing?: string;
    pricingDetails?: string;
    freeTrial?: boolean;

    featured?: boolean;
    verified?: boolean;

    status?: "draft" | "published" | "rejected" | "pending";

    features?: string[];
    useCases?: string[];
    pros?: string[];
    cons?: string[];

    metaTitle?: string;
    metaDescription?: string;

    reviewedBy?: string;
    lastUpdated?: string;

    adminNotes?: string;
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

function cleanUndefined(obj: Record<string, any>) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out;
}

function normalizeTags(input: any): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String).map((t) => t.trim()).filter(Boolean);
    if (typeof input === "string")
        return input
            .split(/[,]+/)
            .map((t) => t.trim())
            .filter(Boolean);
    return [];
}

function normalizeUrls(input: any): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String).map((t) => t.trim()).filter(Boolean);
    if (typeof input === "string")
        return input
            .split(/[\n,]+/)
            .map((t) => t.trim())
            .filter(Boolean);
    return [];
}

function splitLines(v: string): string[] {
    return (v || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
}

function joinLines(arr?: string[]) {
    return (arr || []).join("\n");
}

async function getIdTokenOrThrow() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("UNAUTHENTICATED");
    return user.getIdToken();
}

function TabButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "px-3 py-2 rounded-xl text-sm font-semibold border transition",
                active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export default function EditToolClient({ tool }: { tool: ToolLike }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [tab, setTab] = useState<"basics" | "pricing" | "content" | "seo" | "admin">("basics");

    const [form, setForm] = useState<ToolLike>(() => ({
        ...tool,
        tags: Array.isArray(tool.tags) ? tool.tags : [],
        screenshots: Array.isArray(tool.screenshots) ? tool.screenshots : [],
        features: Array.isArray(tool.features) ? tool.features : [],
        pros: Array.isArray(tool.pros) ? tool.pros : [],
        cons: Array.isArray(tool.cons) ? tool.cons : [],
        useCases: Array.isArray(tool.useCases) ? tool.useCases : [],
    }));

    const tagsText = useMemo(() => (form.tags || []).join(", "), [form.tags]);
    const screenshotsText = useMemo(() => (form.screenshots || []).join("\n"), [form.screenshots]);

    const featuresText = useMemo(() => joinLines(form.features), [form.features]);
    const prosText = useMemo(() => joinLines(form.pros), [form.pros]);
    const consText = useMemo(() => joinLines(form.cons), [form.cons]);
    const useCasesText = useMemo(() => joinLines(form.useCases), [form.useCases]);

    function setField<K extends keyof ToolLike>(key: K, value: ToolLike[K]) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    async function save() {
        setSaving(true);
        try {
            const token = await getIdTokenOrThrow();

            const payload = cleanUndefined({
                ...form,

                // enforce formats
                tags: normalizeTags(form.tags),
                screenshots: normalizeUrls(form.screenshots),

                website: (form.website || "").trim(),
                affiliateUrl: (form.affiliateUrl || "").trim() || null,
                logo: (form.logo || "").trim() || null,

                affiliateNetwork: (form.affiliateNetwork || "").trim() || null,
                affiliateNotes: (form.affiliateNotes || "").trim() || null,

                pricing: (form.pricing || "").trim(),
                pricingDetails: (form.pricingDetails || "").trim() || null,

                metaTitle: (form.metaTitle || "").trim() || null,
                metaDescription: (form.metaDescription || "").trim() || null,

                adminNotes: (form.adminNotes || "").trim() || null,

                features: Array.isArray(form.features) ? form.features : [],
                pros: Array.isArray(form.pros) ? form.pros : [],
                cons: Array.isArray(form.cons) ? form.cons : [],
                useCases: Array.isArray(form.useCases) ? form.useCases : [],
            });

            const res = await fetch(`/api/admin/tools/${tool.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const token = await getIdTokenOrThrow();

            const res = await fetch(`/api/admin/tools/${tool.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

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
        <main className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Tool</h1>
                        <p className="text-sm text-muted-foreground">ID: {tool.id}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                router.push("/admin/tools");
                                router.refresh();
                            }}
                            className="px-4 py-2 rounded-xl border border-border hover:bg-accent"
                        >
                            Back
                        </button>

                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                            onClick={removeTool}
                            disabled={deleting}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-60"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    <TabButton active={tab === "basics"} onClick={() => setTab("basics")}>
                        Basics
                    </TabButton>
                    <TabButton active={tab === "pricing"} onClick={() => setTab("pricing")}>
                        Pricing
                    </TabButton>
                    <TabButton active={tab === "content"} onClick={() => setTab("content")}>
                        Content
                    </TabButton>
                    <TabButton active={tab === "seo"} onClick={() => setTab("seo")}>
                        SEO
                    </TabButton>
                    <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>
                        Admin
                    </TabButton>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form */}
                <section className="lg:col-span-2 space-y-6 bg-card border border-border rounded-2xl p-6">
                    {/* BASICS */}
                    {tab === "basics" ? (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        value={form.name || ""}
                                        onChange={(e) => setField("name", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Slug (optional)</label>
                                    <input
                                        value={form.slug || ""}
                                        onChange={(e) => setField("slug", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        value={form.category || ""}
                                        onChange={(e) => setField("category", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
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
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    >
                                        <option value="draft">draft</option>
                                        <option value="published">published</option>
                                        <option value="pending">pending</option>
                                        <option value="rejected">rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tagline</label>
                                <input
                                    value={form.tagline || ""}
                                    onChange={(e) => setField("tagline", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={6}
                                    value={form.description || ""}
                                    onChange={(e) => setField("description", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Website</label>
                                    <input
                                        value={form.website || ""}
                                        onChange={(e) => setField("website", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Logo URL</label>
                                    <input
                                        value={form.logo || ""}
                                        onChange={(e) => setField("logo", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder="https://.../logo.png"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tags (comma-separated)</label>
                                <input
                                    value={tagsText}
                                    onChange={(e) => setField("tags", normalizeTags(e.target.value))}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder="seo, writing, automation"
                                />
                            </div>

                            <div className="flex flex-wrap gap-6 pt-2">
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
                    ) : null}

                    {/* PRICING */}
                    {tab === "pricing" ? (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Pricing (short)</label>
                                    <input
                                        value={form.pricing || ""}
                                        onChange={(e) => setField("pricing", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder='e.g. "Free", "Freemium", "Paid from $20/mo"'
                                    />
                                </div>

                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={!!form.freeTrial}
                                            onChange={(e) => setField("freeTrial", e.target.checked)}
                                        />
                                        Has Free Trial
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Pricing Details (full plans)</label>
                                <textarea
                                    rows={12}
                                    value={form.pricingDetails || ""}
                                    onChange={(e) => setField("pricingDetails", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder={`Free: $0/mo ...\nPro: $20/mo ...\nTeam: $200/mo ...`}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    حط هنا Plans كاملة بحال اللي عطيتني ديال Synth (مزيان لـ SEO).
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* CONTENT */}
                    {tab === "content" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium">Screenshots (one URL per line)</label>
                                <textarea
                                    rows={6}
                                    value={screenshotsText}
                                    onChange={(e) => setField("screenshots", normalizeUrls(e.target.value))}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder={`https://...\nhttps://...`}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Features (one per line)</label>
                                    <textarea
                                        rows={8}
                                        value={featuresText}
                                        onChange={(e) => setField("features", splitLines(e.target.value))}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder={`Fast setup\nChrome extension\nTeam workspace`}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Use Cases (one per line)</label>
                                    <textarea
                                        rows={8}
                                        value={useCasesText}
                                        onChange={(e) => setField("useCases", splitLines(e.target.value))}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder={`SEO writing\nVideo summarization\nDocs generation`}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Pros (one per line)</label>
                                    <textarea
                                        rows={8}
                                        value={prosText}
                                        onChange={(e) => setField("pros", splitLines(e.target.value))}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Cons (one per line)</label>
                                    <textarea
                                        rows={8}
                                        value={consText}
                                        onChange={(e) => setField("cons", splitLines(e.target.value))}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* SEO */}
                    {tab === "seo" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium">Meta Title</label>
                                <input
                                    value={form.metaTitle || ""}
                                    onChange={(e) => setField("metaTitle", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder="Synth AI — Pricing, Features, Alternatives"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Meta Description</label>
                                <textarea
                                    rows={4}
                                    value={form.metaDescription || ""}
                                    onChange={(e) => setField("metaDescription", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder="Short SEO description (150–160 chars)"
                                />
                            </div>
                        </div>
                    ) : null}

                    {/* ADMIN */}
                    {tab === "admin" ? (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium">Affiliate URL</label>
                                    <input
                                        value={form.affiliateUrl || ""}
                                        onChange={(e) => setField("affiliateUrl", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Affiliate Network</label>
                                    <input
                                        value={form.affiliateNetwork || ""}
                                        onChange={(e) => setField("affiliateNetwork", e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                        placeholder="PartnerStack / Impact / CJ / Direct"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Affiliate Notes (private)</label>
                                <textarea
                                    rows={5}
                                    value={form.affiliateNotes || ""}
                                    onChange={(e) => setField("affiliateNotes", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder="Commission %, cookie duration, payout, rules..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Admin Notes (private)</label>
                                <textarea
                                    rows={6}
                                    value={form.adminNotes || ""}
                                    onChange={(e) => setField("adminNotes", e.target.value)}
                                    className="mt-2 w-full px-4 py-2 rounded-xl border border-input bg-background"
                                    placeholder="Any internal notes..."
                                />
                            </div>
                        </div>
                    ) : null}
                </section>

                {/* Preview */}
                <aside className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-5 sticky top-6">
                        <div className="font-semibold mb-3">Preview</div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground">Name</div>
                                <div className="font-medium">{(form.name || "").trim() || "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Category</div>
                                <div>{(form.category || "").trim() || "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Status</div>
                                <div className="font-mono">{form.status || "draft"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Pricing</div>
                                <div>{(form.pricing || "").trim() || "—"}</div>
                            </div>

                            {form.freeTrial ? (
                                <div className="text-xs inline-flex px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold w-fit">
                                    Free trial
                                </div>
                            ) : null}

                            {(form.tags || []).length ? (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Tags</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(form.tags || []).slice(0, 10).map((t) => (
                                            <span
                                                key={t.toLowerCase()}
                                                className="px-2 py-1 rounded-full bg-muted border border-border text-xs"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {form.website ? (
                                <div>
                                    <div className="text-xs text-muted-foreground">Website</div>
                                    <a className="text-primary break-all hover:underline" href={form.website} target="_blank">
                                        {form.website}
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type SponsorTier = "none" | "featured" | "homepage" | "top";

type FormState = {
    name: string;
    slug: string;
    description: string;
    category: string;
    website: string;
    logo: string;
    pricing: string;
    affiliateUrl: string;
    affiliateNetwork: string;
    published: boolean;
    featured: boolean;
    sponsored: boolean;
    sponsorTier: SponsorTier;
    sponsorPriority: string;
    sponsorUntil: string;
    sponsorLabel: string;
};

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function fromDatetimeLocalInput(v: string) {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export default function ToolForm() {
    const [f, setF] = useState<FormState>({
        name: "",
        slug: "",
        description: "",
        category: "general",
        website: "",
        logo: "",
        pricing: "",
        affiliateUrl: "",
        affiliateNetwork: "",
        published: true,
        featured: false,
        sponsored: false,
        sponsorTier: "featured",
        sponsorPriority: "20",
        sponsorUntil: "",
        sponsorLabel: "Sponsored",
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    function set<K extends keyof FormState>(k: K, v: FormState[K]) {
        setF((p) => ({ ...p, [k]: v }));
    }

    async function submit() {
        setErr(null);
        setMsg(null);

        if (!f.name.trim()) return setErr("Name is required.");
        if (!f.slug.trim()) return setErr("Slug is required.");

        setLoading(true);
        try {
            const res = await fetch("/api/admin/tools/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...f,
                    sponsorPriority: Number(f.sponsorPriority || 0),
                    sponsorUntil: f.sponsored ? fromDatetimeLocalInput(f.sponsorUntil) : null,
                    sponsorLabel: f.sponsored ? f.sponsorLabel : null,
                    sponsorTier: f.sponsored ? f.sponsorTier : "none",
                }),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) {
                setErr(j?.error || "Create failed");
                return;
            }

            setMsg(`✅ Tool created successfully. ID: ${j?.id || ""}`);

            setF((p) => ({
                ...p,
                name: "",
                slug: "",
                description: "",
                website: "",
                logo: "",
                pricing: "",
                affiliateUrl: "",
                affiliateNetwork: "",
                sponsored: false,
                sponsorTier: "featured",
                sponsorPriority: "20",
                sponsorUntil: "",
                sponsorLabel: "Sponsored",
            }));
        } catch {
            setErr("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
            <div className="grid gap-4">
                <Field label="Name *">
                    <input
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                        placeholder="e.g. Canva"
                        value={f.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            set("name", name);
                            if (!f.slug) set("slug", slugify(name));
                        }}
                    />
                </Field>

                <Field label="Slug *">
                    <input
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                        placeholder="e.g. canva"
                        value={f.slug}
                        onChange={(e) => set("slug", slugify(e.target.value))}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                        Unique document ID. Example: <b>chatgpt</b>, <b>canva</b>, <b>midjourney</b>.
                    </p>
                </Field>

                <Field label="Description">
                    <textarea
                        className="w-full min-h-[130px] rounded-2xl border border-border bg-background px-4 py-3"
                        placeholder="Short description of the tool..."
                        value={f.description}
                        onChange={(e) => set("description", e.target.value)}
                    />
                </Field>

                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Category">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="e.g. images, writing, productivity"
                            value={f.category}
                            onChange={(e) => set("category", e.target.value)}
                        />
                    </Field>

                    <Field label="Pricing">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="free / freemium / paid"
                            value={f.pricing}
                            onChange={(e) => set("pricing", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Website URL">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="https://..."
                            value={f.website}
                            onChange={(e) => set("website", e.target.value)}
                        />
                    </Field>

                    <Field label="Logo URL">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="https://.../logo.png"
                            value={f.logo}
                            onChange={(e) => set("logo", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Affiliate URL">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="https://affiliate-link.com/..."
                            value={f.affiliateUrl}
                            onChange={(e) => set("affiliateUrl", e.target.value)}
                        />
                    </Field>

                    <Field label="Affiliate Network">
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            placeholder="PartnerStack / Impact / Direct / etc."
                            value={f.affiliateNetwork}
                            onChange={(e) => set("affiliateNetwork", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={f.published}
                            onChange={(e) => set("published", e.target.checked)}
                        />
                        Published
                    </label>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={f.featured}
                            onChange={(e) => set("featured", e.target.checked)}
                        />
                        Featured
                    </label>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={f.sponsored}
                            onChange={(e) => set("sponsored", e.target.checked)}
                        />
                        Sponsored
                    </label>
                </div>

                {f.sponsored ? (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Sponsor Tier">
                                <select
                                    className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                    value={f.sponsorTier}
                                    onChange={(e) => set("sponsorTier", e.target.value as SponsorTier)}
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
                                    value={f.sponsorPriority}
                                    onChange={(e) => set("sponsorPriority", e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Sponsor Until">
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                    value={f.sponsorUntil}
                                    onChange={(e) => set("sponsorUntil", e.target.value)}
                                />
                            </Field>

                            <Field label="Sponsor Label">
                                <input
                                    className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                    value={f.sponsorLabel}
                                    onChange={(e) => set("sponsorLabel", e.target.value)}
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

                {msg ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {msg}
                    </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/admin/tools"
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                    >
                        ← Back to Tools
                    </Link>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                    >
                        {loading ? "Saving…" : "Create tool"}
                    </button>
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
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
    "Writing",
    "Images",
    "Video",
    "Audio",
    "Marketing",
    "Productivity",
    "Research",
    "Utilities",
    "Developer Tools",
];

export default function SubmitToolClient() {
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        tagline: "",
        description: "",
        category: "",
        tags: "",
        pricing: "",
        websiteUrl: "",
        affiliateUrl: "",
        logoUrl: "",
        contactEmail: "",
        notes: "",

        // honeypot (hidden)
        companyWebsite: "",
    });

    const canSubmit = useMemo(() => {
        return (
            form.name.trim().length >= 2 &&
            form.tagline.trim().length >= 5 &&
            form.description.trim().length >= 30 &&
            form.category.trim().length >= 2 &&
            (form.websiteUrl.trim().length > 0 || form.affiliateUrl.trim().length > 0)
        );
    }, [form]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setOk(false);

        if (!canSubmit) {
            setError("Please fill the required fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/tool-submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.error || "Submission failed.");
                return;
            }

            setOk(true);
            setForm((p) => ({
                ...p,
                name: "",
                tagline: "",
                description: "",
                category: "",
                tags: "",
                pricing: "",
                websiteUrl: "",
                affiliateUrl: "",
                logoUrl: "",
                contactEmail: "",
                notes: "",
                companyWebsite: "",
            }));
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold font-display">Submit Your AI Tool</h1>
                <p className="text-muted-foreground mt-2">
                    Fill in the details below. We review submissions and publish the best tools.
                </p>
                <div className="mt-3 text-sm text-muted-foreground">
                    Want to browse first?{" "}
                    <Link className="text-primary hover:underline" href="/tools">
                        Explore tools →
                    </Link>
                </div>
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                {ok ? (
                    <div className="rounded-xl border border-border bg-background p-5">
                        <div className="font-semibold">✅ Submission received</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Thanks! Your tool is now pending review.
                        </p>
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 mb-5">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Honeypot */}
                    <input
                        value={form.companyWebsite}
                        onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Tool name *"
                            placeholder="e.g. VidOpt"
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            maxLength={80}
                        />
                        <Field
                            label="Category *"
                            placeholder="Select category"
                            value={form.category}
                            onChange={(v) => setForm({ ...form, category: v })}
                            asSelect
                            options={CATEGORIES}
                        />
                    </div>

                    <Field
                        label="Tagline *"
                        placeholder="One line that explains what the tool does"
                        value={form.tagline}
                        onChange={(v) => setForm({ ...form, tagline: v })}
                        maxLength={140}
                    />

                    <Field
                        label="Description *"
                        placeholder="Explain the tool, its main features, and who it’s for (min 30 chars)"
                        value={form.description}
                        onChange={(v) => setForm({ ...form, description: v })}
                        asTextarea
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Website URL *"
                            placeholder="https://..."
                            value={form.websiteUrl}
                            onChange={(v) => setForm({ ...form, websiteUrl: v })}
                        />
                        <Field
                            label="Affiliate URL (optional)"
                            placeholder="https://..."
                            value={form.affiliateUrl}
                            onChange={(v) => setForm({ ...form, affiliateUrl: v })}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Pricing (optional)"
                            placeholder="e.g. Freemium, Paid from $12/mo"
                            value={form.pricing}
                            onChange={(v) => setForm({ ...form, pricing: v })}
                            maxLength={60}
                        />
                        <Field
                            label="Logo URL (optional)"
                            placeholder="https://.../logo.png"
                            value={form.logoUrl}
                            onChange={(v) => setForm({ ...form, logoUrl: v })}
                        />
                    </div>

                    <Field
                        label="Tags (optional)"
                        hint="Comma-separated (max 12)"
                        placeholder="writing, seo, productivity"
                        value={form.tags}
                        onChange={(v) => setForm({ ...form, tags: v })}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Contact email (optional)"
                            placeholder="you@company.com"
                            value={form.contactEmail}
                            onChange={(v) => setForm({ ...form, contactEmail: v })}
                        />
                        <Field
                            label="Notes (optional)"
                            placeholder="Anything you want us to know"
                            value={form.notes}
                            onChange={(v) => setForm({ ...form, notes: v })}
                            maxLength={300}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Tool"}
                    </button>

                    <p className="text-xs text-muted-foreground">
                        By submitting, you confirm the information is accurate and you own/have rights to share it.
                    </p>
                </form>
            </section>
        </main>
    );
}

function Field(props: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    asTextarea?: boolean;
    asSelect?: boolean;
    options?: string[];
    maxLength?: number;
}) {
    const { label, placeholder, value, onChange, hint, asTextarea, asSelect, options, maxLength } = props;

    return (
        <label className="block">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{label}</span>
                {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
            </div>

            {asSelect ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
                >
                    <option value="">{placeholder || "Select..."}</option>
                    {(options || []).map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            ) : asTextarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={6}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
                />
            )}
        </label>
    );
}

"use client";

import { useMemo, useState } from "react";

const CATEGORIES = [
    "audio",
    "code",
    "developer-tools",
    "images",
    "marketing",
    "productivity",
    "research",
    "utilities",
    "video",
    "writing",
];

const PRICING = ["Free", "Freemium", "Paid", "Subscription", "Credits-based", "Enterprise"];

function isValidHttpUrl(u: string) {
    try {
        const url = new URL(u);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export default function SubmitToolFormClient() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        websiteUrl: "",
        tagline: "",
        description: "",
        category: "",
        pricing: "Freemium",
        email: "",
        affiliateUrl: "",
        logo: "",
        tags: "",
    });

    const parsedTags = useMemo(() => {
        return form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12);
    }, [form.tags]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // quick validation
        if (!form.name || !form.websiteUrl || !form.tagline || !form.category || !form.pricing || !form.email) {
            setError("Please fill all required fields.");
            return;
        }
        if (!isValidHttpUrl(form.websiteUrl)) {
            setError("Website URL must start with https://");
            return;
        }
        if (form.affiliateUrl && !isValidHttpUrl(form.affiliateUrl)) {
            setError("Affiliate URL must start with https://");
            return;
        }
        if (form.logo && !isValidHttpUrl(form.logo)) {
            setError("Logo URL must start with https://");
            return;
        }
        if (!form.email.includes("@")) {
            setError("Please enter a valid email.");
            return;
        }

        setLoading(true);

        try {
            // ✅ IMPORTANT: match API expected field names
            // submit-tool API expects: name, website, tagline, description, category, pricing, email, affiliateUrl, logo, tags
            const payload = {
                name: form.name,
                website: form.websiteUrl, // <-- map websiteUrl -> website
                tagline: form.tagline,
                description: form.description,
                category: form.category,
                pricing: form.pricing,
                email: form.email,
                affiliateUrl: form.affiliateUrl || null,
                logo: form.logo || null,
                tags: parsedTags.join(", "), // <-- send as string (safe)
            };

            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // ✅ Read response safely (JSON or text)
            const text = await res.text();
            let data: any = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!res.ok) {
                const msg = data?.error || data?.message || text || `Submission failed (${res.status})`;
                throw new Error(msg);
            }

            setDone(true);
        } catch (err: any) {
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
                <div className="text-2xl font-bold">✅ Submitted!</div>
                <p className="mt-2 text-muted-foreground">Thanks — we’ll review your tool and email you when it’s approved.</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Tool Name *</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="e.g. CopyCraft"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Website URL *</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="https://..."
                        value={form.websiteUrl}
                        onChange={(e) => setForm((s) => ({ ...s, websiteUrl: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Tagline *</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Short catchy description (max ~100 chars)"
                        value={form.tagline}
                        onChange={(e) => setForm((s) => ({ ...s, tagline: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="mt-2 w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="What does the tool do? Who is it for?"
                        value={form.description}
                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        value={form.category}
                        onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium">Pricing *</label>
                    <select
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        value={form.pricing}
                        onChange={(e) => setForm((s) => ({ ...s, pricing: e.target.value }))}
                    >
                        {PRICING.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Your Email *</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="For update notifications"
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Affiliate URL (optional)</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="https://..."
                        value={form.affiliateUrl}
                        onChange={(e) => setForm((s) => ({ ...s, affiliateUrl: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Logo URL (optional)</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="https://.../logo.png"
                        value={form.logo}
                        onChange={(e) => setForm((s) => ({ ...s, logo: e.target.value }))}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Tags (optional)</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="comma separated: writing, seo, automation"
                        value={form.tags}
                        onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
                    />

                    {parsedTags.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {parsedTags.map((t) => (
                                <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            {error ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
                {loading ? "Submitting..." : "Submit Tool"}
            </button>

            <p className="mt-3 text-xs text-muted-foreground text-center">
                By submitting, you agree that your tool may be reviewed and listed publicly after approval.
            </p>
        </form>
    );
}

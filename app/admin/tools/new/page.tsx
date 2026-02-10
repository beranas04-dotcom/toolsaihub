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

function ensureHttps(url: string) {
    const v = (url || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
}

function isValidHttpUrl(value: string) {
    try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

function splitLines(v: string) {
    return (v || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
}

function joinLines(arr?: string[]) {
    return (arr || []).join("\n");
}

function uniqueLower(arr: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const x of arr) {
        const k = x.toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            out.push(x);
        }
    }
    return out;
}

export default function AdminNewToolPage() {
    const router = useRouter();

    // core
    const [name, setName] = useState("");
    const autoSlug = useMemo(() => slugify(name), [name]);
    const [slug, setSlug] = useState(""); // allow manual override

    const [websiteUrl, setWebsiteUrl] = useState("");
    const [affiliateUrl, setAffiliateUrl] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    const [pricing, setPricing] = useState<"free" | "freemium" | "paid">("freemium");
    const [status, setStatus] = useState<"draft" | "published">("draft");
    const [featured, setFeatured] = useState(false);
    const [verified, setVerified] = useState(false);
    const [freeTrial, setFreeTrial] = useState(false);

    // tags chips
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    // rich lists
    const [featuresText, setFeaturesText] = useState("");
    const [prosText, setProsText] = useState("");
    const [consText, setConsText] = useState("");
    const [useCasesText, setUseCasesText] = useState("");

    // meta
    const [reviewedBy, setReviewedBy] = useState("AIToolsHub Team");

    const effectiveSlug = (slug || autoSlug).trim();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function addTagsFromText(raw: string) {
        const parts = raw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        if (!parts.length) return;

        setTags((prev) => uniqueLower([...prev, ...parts]));
        setTagInput("");
    }

    function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTagsFromText(tagInput);
        } else if (e.key === "Backspace" && !tagInput && tags.length) {
            // remove last
            setTags((prev) => prev.slice(0, -1));
        }
    }

    function removeTag(t: string) {
        setTags((prev) => prev.filter((x) => x.toLowerCase() !== t.toLowerCase()));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const finalSlug = effectiveSlug;
        const finalWebsite = ensureHttps(websiteUrl);
        const finalAffiliate = affiliateUrl ? ensureHttps(affiliateUrl) : "";
        const finalLogo = logoUrl ? ensureHttps(logoUrl) : "";

        if (!name.trim()) return setError("Name is required.");
        if (!finalSlug) return setError("Slug is required (name is too short).");
        if (!category.trim()) return setError("Category is required.");
        if (!finalWebsite) return setError("Website URL is required.");
        if (!isValidHttpUrl(finalWebsite)) return setError("Website URL is invalid.");

        if (finalAffiliate && !isValidHttpUrl(finalAffiliate)) {
            return setError("Affiliate URL is invalid.");
        }
        if (finalLogo && !isValidHttpUrl(finalLogo)) {
            return setError("Logo URL is invalid.");
        }

        setSaving(true);
        try {
            const payload = {
                // identity
                id: finalSlug,
                slug: finalSlug,

                // content
                name: name.trim(),
                websiteUrl: finalWebsite,
                affiliateUrl: finalAffiliate,
                logo: finalLogo,
                tagline: tagline.trim(),
                description: description.trim(),
                category: category.trim(),
                pricing,
                status,
                featured,
                verified,
                freeTrial,
                tags,

                // rich arrays
                features: splitLines(featuresText),
                pros: splitLines(prosText),
                cons: splitLines(consText),
                useCases: splitLines(useCasesText),

                // meta
                reviewedBy: reviewedBy.trim() || "AIToolsHub Team",
                lastUpdated: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };

            const res = await fetch("/api/admin/tools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">➕ Add New Tool</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new tool entry (saved to Firestore via /api/admin/tools).
                    </p>
                </div>
                <button onClick={() => router.push("/admin/tools")} className="text-sm underline">
                    Back
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* FORM */}
                <form
                    onSubmit={onSubmit}
                    className="lg:col-span-2 space-y-6 bg-card border border-border rounded-2xl p-6"
                >
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Basic */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="font-medium">Name *</label>
                            <input
                                className="border border-border rounded-lg px-3 py-2 bg-background"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Jasper AI"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="font-medium">Slug (ID) *</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background font-mono"
                                    value={slug}
                                    onChange={(e) => setSlug(slugify(e.target.value))}
                                    placeholder={autoSlug || "auto-generated-from-name"}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Final slug: <span className="font-mono">{effectiveSlug || "—"}</span>
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <label className="font-medium">Category *</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. writing"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="font-medium">Website URL *</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    onBlur={() => setWebsiteUrl(ensureHttps(websiteUrl))}
                                    placeholder="https://example.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tip: we auto-add https:// if missing.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <label className="font-medium">Affiliate URL (optional)</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background"
                                    value={affiliateUrl}
                                    onChange={(e) => setAffiliateUrl(e.target.value)}
                                    onBlur={() => setAffiliateUrl(affiliateUrl ? ensureHttps(affiliateUrl) : "")}
                                    placeholder="https://partner.example.com/?ref=..."
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="font-medium">Logo URL (optional)</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    onBlur={() => setLogoUrl(logoUrl ? ensureHttps(logoUrl) : "")}
                                    placeholder="https://.../logo.png"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="font-medium">Reviewed by</label>
                                <input
                                    className="border border-border rounded-lg px-3 py-2 bg-background"
                                    value={reviewedBy}
                                    onChange={(e) => setReviewedBy(e.target.value)}
                                    placeholder="AIToolsHub Team"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="font-medium">Tagline</label>
                            <input
                                className="border border-border rounded-lg px-3 py-2 bg-background"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                placeholder="Short one-line value proposition (max ~100 chars)"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="font-medium">Description</label>
                            <textarea
                                className="border border-border rounded-lg px-3 py-2 bg-background min-h-[140px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this tool do? Who is it for? Why is it useful?"
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background">
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                            />
                            Featured (homepage)
                        </label>

                        <label className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background">
                            <input
                                type="checkbox"
                                checked={verified}
                                onChange={(e) => setVerified(e.target.checked)}
                            />
                            Verified
                        </label>

                        <label className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-background">
                            <input
                                type="checkbox"
                                checked={freeTrial}
                                onChange={(e) => setFreeTrial(e.target.checked)}
                            />
                            Free trial
                        </label>
                    </div>

                    {/* Tags chips */}
                    <div className="grid gap-2">
                        <label className="font-medium">Tags</label>

                        <div className="border border-border rounded-lg bg-background px-3 py-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((t) => (
                                    <span
                                        key={t.toLowerCase()}
                                        className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-muted border border-border"
                                    >
                                        {t}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(t)}
                                            className="text-muted-foreground hover:text-foreground"
                                            aria-label={`Remove tag ${t}`}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                                {!tags.length && (
                                    <span className="text-xs text-muted-foreground">
                                        Add tags (press Enter or comma)
                                    </span>
                                )}
                            </div>

                            <input
                                className="w-full outline-none bg-transparent text-sm"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={onTagKeyDown}
                                onBlur={() => {
                                    if (tagInput.trim()) addTagsFromText(tagInput);
                                }}
                                placeholder="e.g. seo, writing, marketing"
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Tip: write a tag and press <b>Enter</b> (or comma). Backspace deletes last tag.
                        </p>
                    </div>

                    {/* Rich lists */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="font-medium">Features (one per line)</label>
                            <textarea
                                className="border border-border rounded-lg px-3 py-2 bg-background min-h-[110px]"
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                placeholder={`Fast setup\nChrome extension\nTeam workspace`}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="font-medium">Pros (one per line)</label>
                                <textarea
                                    className="border border-border rounded-lg px-3 py-2 bg-background min-h-[110px]"
                                    value={prosText}
                                    onChange={(e) => setProsText(e.target.value)}
                                    placeholder={`Easy to use\nHigh quality output`}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="font-medium">Cons (one per line)</label>
                                <textarea
                                    className="border border-border rounded-lg px-3 py-2 bg-background min-h-[110px]"
                                    value={consText}
                                    onChange={(e) => setConsText(e.target.value)}
                                    placeholder={`Limited free plan\nNo mobile app`}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="font-medium">Use cases (one per line)</label>
                            <textarea
                                className="border border-border rounded-lg px-3 py-2 bg-background min-h-[110px]"
                                value={useCasesText}
                                onChange={(e) => setUseCasesText(e.target.value)}
                                placeholder={`Blog writing\nSEO optimization\nEmail copy`}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg disabled:opacity-60 font-semibold"
                        >
                            {saving ? "Saving..." : "Create Tool"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/admin/tools")}
                            className="px-5 py-2.5 rounded-lg bg-muted hover:bg-muted/80 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* PREVIEW */}
                <aside className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl p-5 sticky top-6">
                        <div className="font-semibold mb-3">Preview</div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground">Name</div>
                                <div className="font-medium">{name.trim() || "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Slug</div>
                                <div className="font-mono">{effectiveSlug || "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Category</div>
                                <div>{category.trim() || "—"}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Website</div>
                                <div className="break-words">{ensureHttps(websiteUrl) || "—"}</div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded bg-muted border border-border text-xs">
                                    {pricing}
                                </span>
                                <span className="px-2 py-1 rounded bg-muted border border-border text-xs">
                                    {status}
                                </span>
                                {featured && (
                                    <span className="px-2 py-1 rounded bg-muted border border-border text-xs">
                                        featured
                                    </span>
                                )}
                                {verified && (
                                    <span className="px-2 py-1 rounded bg-muted border border-border text-xs">
                                        verified
                                    </span>
                                )}
                                {freeTrial && (
                                    <span className="px-2 py-1 rounded bg-muted border border-border text-xs">
                                        free trial
                                    </span>
                                )}
                            </div>

                            {tagline.trim() ? (
                                <div>
                                    <div className="text-xs text-muted-foreground">Tagline</div>
                                    <div>{tagline.trim()}</div>
                                </div>
                            ) : null}

                            {tags.length ? (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Tags</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.slice(0, 10).map((t) => (
                                            <span
                                                key={t.toLowerCase()}
                                                className="px-2 py-1 rounded-full bg-muted border border-border text-xs"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                        {tags.length > 10 && (
                                            <span className="text-xs text-muted-foreground">
                                                +{tags.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {logoUrl.trim() ? (
                                <div>
                                    <div className="text-xs text-muted-foreground">Logo</div>
                                    <div className="break-words">{ensureHttps(logoUrl)}</div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

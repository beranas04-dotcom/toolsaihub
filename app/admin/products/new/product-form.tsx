"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = {
    title: string;
    description: string;
    category: string;
    tier: "free" | "pro";
    fileUrl: string; // Drive fileId
    coverImage: string;
    tags: string; // comma-separated
    published: boolean;
};

export default function ProductForm() {
    const [f, setF] = useState<FormState>({
        title: "",
        description: "",
        category: "general",
        tier: "pro",
        fileUrl: "",
        coverImage: "",
        tags: "",
        published: true,
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    function set<K extends keyof FormState>(k: K, v: FormState[K]) {
        setF((p) => ({ ...p, [k]: v }));
    }

    async function submit() {
        setMsg(null);
        setErr(null);

        if (!f.title.trim()) return setErr("Title is required.");
        if (!f.fileUrl.trim()) return setErr("Drive fileId (fileUrl) is required.");

        setLoading(true);
        try {
            const res = await fetch("/api/admin/products/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(f),
            });

            const j = await res.json().catch(() => null);
            if (!res.ok) {
                setErr(j?.error || "Failed to create product");
                return;
            }

            setMsg(`✅ Product created. ID: ${j?.id || ""}`);

            setF((p) => ({
                ...p,
                title: "",
                description: "",
                fileUrl: "",
                coverImage: "",
                tags: "",
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
                <Field label="Title *">
                    <input
                        value={f.title}
                        onChange={(e) => set("title", e.target.value)}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="e.g. High-Converting Landing Page Kit"
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={f.description}
                        onChange={(e) => set("description", e.target.value)}
                        className="w-full min-h-[110px] rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="What is this product? Who is it for? What outcome?"
                    />
                </Field>

                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Category">
                        <input
                            value={f.category}
                            onChange={(e) => set("category", e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="marketing, content, offers…"
                        />
                    </Field>

                    <Field label="Tier">
                        <select
                            value={f.tier}
                            onChange={(e) => set("tier", (e.target.value as any) || "pro")}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="pro">Pro</option>
                            <option value="free">Free</option>
                        </select>
                    </Field>
                </div>

                <Field label="Drive fileId (fileUrl) *">
                    <input
                        value={f.fileUrl}
                        onChange={(e) => set("fileUrl", e.target.value)}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="1aBcD... (Google Drive fileId)"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                        Paste the <b>Drive fileId</b> and share the file with your service account email (Viewer).
                    </p>
                </Field>

                <Field label="Cover image URL (optional)">
                    <input
                        value={f.coverImage}
                        onChange={(e) => set("coverImage", e.target.value)}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="https://.../cover.png"
                    />
                </Field>

                <Field label="Tags (comma separated)">
                    <input
                        value={f.tags}
                        onChange={(e) => set("tags", e.target.value)}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="landing page, email, hooks, offers"
                    />
                </Field>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={f.published}
                        onChange={(e) => set("published", e.target.checked)}
                    />
                    Published
                </label>

                <div className="flex items-center justify-between gap-3">
                    <Link href="/admin/products" className="text-sm underline text-muted-foreground hover:text-foreground">
                        ← Back to Products
                    </Link>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                    >
                        {loading ? "Saving…" : "Create product"}
                    </button>
                </div>

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
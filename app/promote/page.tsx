"use client";

import { useState } from "react";
import Link from "next/link";

type SponsorPlan = "featured" | "homepage" | "top";

export default function PromotePage() {
    const [toolId, setToolId] = useState("");
    const [toolName, setToolName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [plan, setPlan] = useState<SponsorPlan>("featured");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function startCheckout() {
        setErr(null);

        if (!toolId.trim()) return setErr("Tool ID / slug is required.");
        if (!toolName.trim()) return setErr("Tool name is required.");
        if (!ownerName.trim()) return setErr("Owner name is required.");
        if (!ownerEmail.trim()) return setErr("Owner email is required.");

        try {
            setLoading(true);

            const res = await fetch("/api/sponsor/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    toolId,
                    toolName,
                    ownerName,
                    ownerEmail,
                    plan,
                    notes,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Failed to start sponsorship checkout");
            }

            if (!data?.url) {
                throw new Error("Missing checkout URL");
            }

            window.location.href = data.url;
        } catch (e: any) {
            console.error(e);
            setErr(e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-16 md:py-20">
            <section className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Sponsored Listings
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Promote your AI tool
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground">
                    Get more visibility with featured placement, homepage exposure, and top ranking inside the directory.
                </p>
            </section>

            <section className="mt-12 grid gap-6 lg:grid-cols-3">
                <PlanCard
                    title="Featured Listing"
                    price="$29"
                    desc="Sponsored visibility inside the tools directory."
                    bullets={[
                        "Sponsored badge",
                        "Higher placement in listings",
                        "Good starter option",
                    ]}
                    active={plan === "featured"}
                    onSelect={() => setPlan("featured")}
                />

                <PlanCard
                    title="Homepage Placement"
                    price="$79"
                    desc="Homepage exposure plus stronger sponsored visibility."
                    bullets={[
                        "Homepage visibility",
                        "Sponsored badge",
                        "Better ranking priority",
                    ]}
                    active={plan === "homepage"}
                    onSelect={() => setPlan("homepage")}
                />

                <PlanCard
                    title="Top Placement"
                    price="$149"
                    desc="Maximum commercial exposure across best/category listings."
                    bullets={[
                        "Top ranking priority",
                        "Strongest sponsored placement",
                        "Best for launches & campaigns",
                    ]}
                    active={plan === "top"}
                    onSelect={() => setPlan("top")}
                />
            </section>

            <section className="mt-12 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                <h2 className="text-2xl font-extrabold">Start sponsorship checkout</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    After payment, your request will be marked as paid and reviewed before activation.
                </p>

                <div className="mt-6 grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Tool ID / Slug *">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={toolId}
                                onChange={(e) => setToolId(e.target.value)}
                                placeholder="e.g. canva"
                            />
                        </Field>

                        <Field label="Tool Name *">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                placeholder="e.g. Canva"
                            />
                        </Field>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Owner Name *">
                            <input
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Your name"
                            />
                        </Field>

                        <Field label="Owner Email *">
                            <input
                                type="email"
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </Field>
                    </div>

                    <Field label="Selected Plan">
                        <select
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            value={plan}
                            onChange={(e) => setPlan(e.target.value as SponsorPlan)}
                        >
                            <option value="featured">featured</option>
                            <option value="homepage">homepage</option>
                            <option value="top">top</option>
                        </select>
                    </Field>

                    <Field label="Notes (optional)">
                        <textarea
                            className="w-full min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Extra details, preferred category, launch date, etc."
                        />
                    </Field>

                    {err ? (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {err}
                        </div>
                    ) : null}

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <Link
                            href="/submit"
                            className="text-sm underline text-muted-foreground hover:text-foreground"
                        >
                            Need to submit your tool first?
                        </Link>

                        <button
                            onClick={startCheckout}
                            disabled={loading}
                            className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                        >
                            {loading ? "Redirecting..." : "Continue to payment"}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

function PlanCard({
    title,
    price,
    desc,
    bullets,
    active,
    onSelect,
}: {
    title: string;
    price: string;
    desc: string;
    bullets: string[];
    active?: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={[
                "text-left rounded-3xl border p-8 backdrop-blur transition",
                active
                    ? "border-primary/40 bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/60 bg-background/35 hover:border-primary/20",
            ].join(" ")}
        >
            <h3 className="text-2xl font-extrabold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

            <div className="mt-6 flex items-end gap-2">
                <p className="text-5xl font-extrabold">{price}</p>
                <p className="text-sm text-muted-foreground mb-2">/ campaign</p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                {bullets.map((item) => (
                    <div key={item} className="flex gap-2">
                        <span>✅</span>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </button>
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
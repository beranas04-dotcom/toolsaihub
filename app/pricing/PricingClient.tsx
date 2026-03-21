"use client";

import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type FaqItem = { q: string; a: string };
export const dynamic = "force-dynamic";
export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();

    const from = (searchParams.get("from") || "").toLowerCase();
    const systemSlug = searchParams.get("slug") || "";
    const productId = searchParams.get("id") || "";

    const context = useMemo(() => {
        if (from === "system") {
            return {
                badge: "Unlock this system",
                title: "Unlock this system and all JLADAN Pro assets",
                desc:
                    "You came from a locked system page. JLADAN Pro unlocks system downloads, premium assets, and the full library.",
                cta: "Unlock this system — $5/mo",
            };
        }

        if (from === "product") {
            return {
                badge: "Unlock this product",
                title: "Unlock this product and the full JLADAN Pro library",
                desc:
                    "You came from a locked product page. JLADAN Pro gives you access to this premium download plus the rest of the premium ecosystem.",
                cta: "Unlock this product — $5/mo",
            };
        }

        return {
            badge: "Unlock premium systems, assets, and downloads",
            title: "JLADAN Pro",
            desc:
                "Stop collecting ideas without execution. JLADAN Pro gives you premium systems, downloadable assets, templates, and practical resources you can use right away.",
            cta: "Unlock JLADAN Pro — $5/mo",
        };
    }, [from]);

    async function subscribe() {
        try {
            setLoading(true);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);

            const sRes = await fetch("/api/user/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
                credentials: "include",
            });

            if (!sRes.ok) {
                const err = await sRes.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to create user session");
            }

            const res = await fetch("/api/lemon/start", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to start checkout");
            if (!data?.url) throw new Error("Missing checkout URL");

            window.location.href = data.url;
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const faqs: FaqItem[] = useMemo(
        () => [
            {
                q: "What do I unlock with JLADAN Pro?",
                a: "You unlock the premium library, downloadable products, premium systems, and gated assets inside JLADAN.",
            },
            {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel anytime from the customer portal. Access remains active until the current billing period ends.",
            },
            {
                q: "What happens after checkout?",
                a: "After payment, your subscription is activated and you can access the library, premium products, and systems immediately.",
            },
            {
                q: "Do I get instant downloads?",
                a: "Yes. Once you have access, premium downloads work instantly and are securely tracked through the platform.",
            },
            {
                q: "Is this for creators only?",
                a: "No. JLADAN Pro is useful for creators, marketers, freelancers, founders, and anyone who wants execution-ready digital assets.",
            },
            {
                q: "Do you offer refunds?",
                a: "Refund requests can be reviewed case by case within the first 7 days.",
            },
        ],
        []
    );

    return (
        <main className="max-w-7xl mx-auto px-4 py-16 md:py-20">
            <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/40 backdrop-blur px-6 py-12 md:px-10 md:py-16">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-20 left-1/2 h-56 w-[620px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute top-10 right-0 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {context.badge}
                    </div>

                    <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">
                        {context.title}
                    </h1>

                    <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                        {context.desc}
                    </p>

                    {(from === "system" && systemSlug) || (from === "product" && productId) ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                            {from === "system"
                                ? `Source: system / ${systemSlug}`
                                : `Source: product / ${productId}`}
                        </p>
                    ) : null}

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={subscribe}
                            disabled={loading}
                            className="rounded-2xl bg-primary px-7 py-3.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                        >
                            {loading ? "Redirecting..." : context.cta}
                        </button>

                        <Link
                            href="/systems"
                            className="rounded-2xl border border-border bg-background px-7 py-3.5 font-semibold hover:bg-muted/30 text-center"
                        >
                            Explore Systems
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>✅ Instant access after checkout</span>
                        <span>✅ Cancel anytime</span>
                        <span>✅ Premium downloads</span>
                        <span>✅ New drops regularly</span>
                    </div>
                </div>
            </section>

            <section className="mt-8 rounded-3xl border border-primary/15 bg-primary/5 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold">What JLADAN Pro unlocks</h2>
                        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                            JLADAN Pro unlocks system assets, premium downloads, and full library access under one simple subscription.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            Locked system assets
                        </span>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            Premium downloads
                        </span>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            Full library access
                        </span>
                    </div>
                </div>
            </section>

            <section className="mt-10 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                    <h2 className="text-2xl font-extrabold">Everything inside JLADAN Pro</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        One plan. Clear offer. Built to help you move faster with premium execution resources.
                    </p>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <FeatureCard title="Premium Library Access" desc="Unlock premium assets, curated downloads, templates, and practical resources." />
                        <FeatureCard title="Systems & Playbooks" desc="Get structured execution systems instead of random scattered content." />
                        <FeatureCard title="Downloadable Products" desc="Access gated files and premium downloadable assets instantly." />
                        <FeatureCard title="Conversion-Ready Resources" desc="Use templates, kits, and frameworks that help you publish and monetize faster." />
                        <FeatureCard title="Ongoing Drops" desc="New premium content can be added over time without needing multiple purchases." />
                        <FeatureCard title="Simple Pricing" desc="One affordable plan that unlocks the full JLADAN Pro experience." />
                    </div>
                </div>

                <div className="rounded-3xl border border-primary/30 bg-background/45 backdrop-blur p-8 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-extrabold">JLADAN Pro</h2>
                            <p className="text-sm text-muted-foreground mt-1">Full premium access</p>
                        </div>
                        <span className="text-xs rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-1">
                            Best value
                        </span>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-end gap-2">
                            <p className="text-5xl font-extrabold">$5</p>
                            <p className="text-sm text-muted-foreground mb-2">/ month</p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            A simple monthly plan that unlocks premium assets, systems, and gated resources.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3 text-sm">
                        <PlanRow text="Unlock premium systems and assets" />
                        <PlanRow text="Access the JLADAN library" />
                        <PlanRow text="Download premium products" />
                        <PlanRow text="Get future drops under the same plan" />
                        <PlanRow text="Cancel anytime" />
                    </div>

                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="mt-8 w-full rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                    >
                        {loading ? "Loading..." : context.cta}
                    </button>

                    <p className="mt-4 text-xs text-muted-foreground">
                        By subscribing, you agree to our{" "}
                        <Link className="underline hover:text-foreground" href="/terms">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link className="underline hover:text-foreground" href="/privacy">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </section>

            <section className="mt-14 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold">Free vs Pro</h2>
                    <p className="mt-2 text-muted-foreground">
                        Clear value difference for users coming from locked pages.
                    </p>
                </div>

                <div className="mt-8 grid lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border bg-background/60 p-6">
                        <h3 className="text-xl font-bold">Free visitor</h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>• Browse public tool pages</li>
                            <li>• Read public previews</li>
                            <li>• Discover categories and best pages</li>
                            <li>• Limited or locked premium assets</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                        <h3 className="text-xl font-bold">JLADAN Pro member</h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>• Access the premium library</li>
                            <li>• Unlock systems assets and downloads</li>
                            <li>• Download premium products</li>
                            <li>• Benefit from ongoing premium content</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mt-16 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center">FAQ</h2>
                <p className="text-center mt-2 text-muted-foreground">
                    Common questions before subscribing
                </p>

                <div className="mt-8 grid gap-4">
                    {faqs.map((item, idx) => (
                        <details
                            key={idx}
                            className="group rounded-2xl border border-border p-5 open:bg-muted/30"
                        >
                            <summary className="cursor-pointer list-none font-semibold flex items-center justify-between">
                                <span>{item.q}</span>
                                <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="rounded-2xl bg-primary px-8 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {loading ? "Redirecting..." : context.cta}
                    </button>

                    <p className="mt-3 text-xs text-muted-foreground">
                        Unlock premium systems, library access, and gated downloads.
                    </p>
                </div>
            </section>
        </main>
    );
}

function FeatureCard({
    title,
    desc,
}: {
    title: string;
    desc: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}

function PlanRow({ text }: { text: string }) {
    return (
        <div className="flex gap-2">
            <span>✅</span>
            <span>{text}</span>
        </div>
    );
}
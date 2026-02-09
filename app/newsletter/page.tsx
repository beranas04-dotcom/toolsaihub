import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import { siteMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
    title: "Newsletter",
    description:
        "Get weekly curated AI tools, guides, and practical workflows. No spam — unsubscribe anytime.",
    alternates: {
        canonical: `${siteMetadata.siteUrl.replace(/\/$/, "")}/newsletter`,
    },
};

export default function NewsletterPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-40 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-52 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-muted/20" />
                </div>

                <div className="relative">
                    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Weekly digest • Curated by AIToolsHub
                    </div>

                    <h1 className="mt-5 text-3xl sm:text-5xl font-bold font-display tracking-tight">
                        Get the best AI tools — every week.
                    </h1>

                    <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
                        We hand-pick useful AI tools, write short practical notes, and send you a clean
                        weekly email. No noise. No spam.
                    </p>

                    <div className="mt-8">
                        <NewsletterForm />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                            ✅ 1 email / week
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                            ✅ Unsubscribe anytime
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                            ✅ Tools + guides + workflows
                        </span>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-semibold hover:bg-muted transition"
                        >
                            Browse tools →
                        </Link>
                        <Link
                            href="/blog"
                            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-semibold hover:bg-muted transition"
                        >
                            Read guides →
                        </Link>
                    </div>
                </div>
            </section>

            {/* What you'll get */}
            <section className="mt-12 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="text-3xl">🧰</div>
                    <h2 className="mt-3 text-lg font-bold">Curated tools</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-6">
                        New tools + hidden gems. We keep the list clean and useful.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="text-3xl">🧠</div>
                    <h2 className="mt-3 text-lg font-bold">Practical notes</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-6">
                        Short tips on how to use tools in real work (SEO, content, design, productivity).
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="text-3xl">⚡</div>
                    <h2 className="mt-3 text-lg font-bold">Workflows</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-6">
                        Simple workflows you can copy to save time: prompts, templates, and checklists.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="mt-12 rounded-3xl border border-border bg-card p-8 sm:p-10">
                <h2 className="text-2xl font-bold">FAQ</h2>

                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-border bg-background p-5">
                        <div className="font-semibold">How often do you send emails?</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            Once per week. Sometimes we skip a week if there’s nothing worth sending.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-5">
                        <div className="font-semibold">Is it free?</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            Yes — it’s free. You can unsubscribe anytime.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-5">
                        <div className="font-semibold">Do you share or sell my email?</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            No. We keep it private and only use it to send the digest.
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

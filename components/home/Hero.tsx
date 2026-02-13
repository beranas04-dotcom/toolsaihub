import Link from "next/link";
import { siteMetadata } from "@/lib/siteMetadata";

export default function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-border bg-background">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/images/hero-bg.jpg"
                    alt="AI Background"
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background"></div>
            </div>

            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
                <div className="absolute -bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full bg-secondary/10 blur-3xl dark:bg-secondary/15" />
                <div className="absolute -bottom-44 right-[-140px] h-[560px] w-[560px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
                <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px]" />
                </div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center">
                    {/* Badge */}
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        Curated directory • Updated weekly
                    </div>

                    {/* Headline */}
                    <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        <span className="block">Find the Right</span>
                        <span className="mt-3 block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                            AI Tools Faster
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        {siteMetadata.tagline ||
                            "Compare top AI tools for work, study, and creativity — with honest summaries, pricing, and use cases."}
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/tools"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 sm:w-auto"
                        >
                            Explore Tools
                        </Link>

                        <Link
                            href="/best"
                            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-7 py-3 text-base font-semibold text-foreground transition hover:bg-accent sm:w-auto"
                        >
                            Best by Use Case
                        </Link>

                        <Link
                            href="/blog"
                            className="inline-flex w-full items-center justify-center rounded-xl px-7 py-3 text-base font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground sm:w-auto"
                        >
                            Read Guides
                        </Link>
                    </div>

                    {/* Quick filters (nice UX, no new logic) */}
                    <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2">
                        {[
                            { label: "Writing", href: "/categories/writing" },
                            { label: "Images", href: "/categories/images" },
                            { label: "Video", href: "/categories/video" },
                            { label: "Productivity", href: "/categories/productivity" },
                            { label: "Developer Tools", href: "/categories/developer-tools" },
                            { label: "Marketing", href: "/categories/marketing" },
                        ].map((c) => (
                            <Link
                                key={c.href}
                                href={c.href}
                                className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                            >
                                {c.label}
                            </Link>
                        ))}
                    </div>

                    {/* Trust */}
                    <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-card/60 p-4">
                            <div className="text-sm font-semibold text-foreground">Clear pricing</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                See free, freemium, and paid options at a glance.
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-card/60 p-4">
                            <div className="text-sm font-semibold text-foreground">Use-case focused</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                Find tools for creators, teams, and students.
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-card/60 p-4">
                            <div className="text-sm font-semibold text-foreground">Updated regularly</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                New tools added and listings refreshed weekly.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

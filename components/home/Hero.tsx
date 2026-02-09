import Link from "next/link";
import { siteMetadata } from "@/lib/siteMetadata";

export default function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-border bg-background">
            {/* Background: soft gradients that respect theme tokens */}
            <div className="pointer-events-none absolute inset-0">
                {/* top glow */}
                <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
                {/* side glow */}
                <div className="absolute -bottom-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-secondary/10 blur-3xl dark:bg-secondary/15" />
                <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />

                {/* subtle grid */}
                <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px]" />
                </div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        Curated directory • Updated weekly
                    </div>

                    {/* Heading */}
                    <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        <span className="block">Discover the Best</span>
                        <span className="mt-3 block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            AI Tools for Work, Study and Creativity
                        </span>
                    </h1>

                    {/* Tagline */}
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        {siteMetadata.tagline ||
                            "Find, compare, and review the best AI tools for creators, teams, and students — updated weekly."}
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/tools"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 sm:w-auto"
                        >
                            Explore AI Tools
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

                    {/* Trust indicators */}
                    <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                            Manually reviewed listings
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                            Fast search & filters
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
                            Reviews you can trust
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

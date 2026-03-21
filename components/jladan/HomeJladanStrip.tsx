import Link from "next/link";

export default function HomeJladanStrip() {
    return (
        <section className="mt-12 rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/10 via-background to-cyan-500/10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        New: JLADAN Pro
                    </div>

                    <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">
                        Need more than discovery? Get the templates, systems, and premium assets behind the work.
                    </h2>

                    <p className="mt-3 text-sm md:text-base text-muted-foreground">
                        JLADAN turns your traffic into revenue with downloadable kits, execution systems,
                        templates, prompts, and premium resources for creators and marketers.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border bg-background/60 px-3 py-1">
                            Premium library
                        </span>
                        <span className="rounded-full border border-border bg-background/60 px-3 py-1">
                            Downloadable assets
                        </span>
                        <span className="rounded-full border border-border bg-background/60 px-3 py-1">
                            Systems & playbooks
                        </span>
                        <span className="rounded-full border border-border bg-background/60 px-3 py-1">
                            $5/month
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/pricing"
                        className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                    >
                        Unlock JLADAN Pro
                    </Link>

                    <Link
                        href="/library"
                        className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                    >
                        View Library
                    </Link>

                    <Link
                        href="/systems"
                        className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                    >
                        Explore Systems
                    </Link>
                </div>
            </div>
        </section>
    );
}
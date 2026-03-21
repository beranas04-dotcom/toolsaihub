import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ThanksPage() {
    return (
        <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/40 backdrop-blur px-6 py-12 md:px-10 md:py-16 text-center">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-20 left-1/2 h-56 w-[620px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute top-10 right-0 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Welcome to JLADAN Pro
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Payment successful 🎉
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Your subscription is now active. You can access premium systems, downloadable products,
                    and the full JLADAN library.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/library"
                        className="rounded-2xl bg-primary px-7 py-3.5 font-semibold text-white hover:opacity-95"
                    >
                        Go to Library
                    </Link>

                    <Link
                        href="/systems"
                        className="rounded-2xl border border-border bg-background px-7 py-3.5 font-semibold hover:bg-muted/30"
                    >
                        Start with Systems
                    </Link>

                    <Link
                        href="/pricing"
                        className="rounded-2xl border border-border bg-background px-7 py-3.5 font-semibold hover:bg-muted/30"
                    >
                        View Plan
                    </Link>
                </div>
            </section>

            <section className="mt-10 grid gap-6 md:grid-cols-3">
                <OnboardingCard
                    step="1"
                    title="Open your Library"
                    desc="Browse all premium products and start with the assets that match your goal."
                    href="/library"
                    label="Open Library"
                />

                <OnboardingCard
                    step="2"
                    title="Start with a System"
                    desc="Use a step-by-step system if you want a clear execution path instead of random browsing."
                    href="/systems"
                    label="Explore Systems"
                />

                <OnboardingCard
                    step="3"
                    title="Download your first asset"
                    desc="Pick a premium product and download something useful immediately to get quick value."
                    href="/library"
                    label="Get a Download"
                />
            </section>

            <section className="mt-10 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                <h2 className="text-2xl font-extrabold text-center">What you unlocked</h2>

                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BenefitCard text="Premium library access" />
                    <BenefitCard text="Systems & playbooks" />
                    <BenefitCard text="Premium downloads" />
                    <BenefitCard text="Future premium drops" />
                </div>
            </section>

            <section className="mt-10 text-center">
                <p className="text-sm text-muted-foreground">
                    Need help getting started? The best first step is usually the library or systems page.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/library"
                        className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                    >
                        Library
                    </Link>

                    <Link
                        href="/systems"
                        className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                    >
                        Systems
                    </Link>

                    <Link
                        href="/tools"
                        className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                    >
                        Back to Tools
                    </Link>
                </div>
            </section>
        </main>
    );
}

function OnboardingCard({
    step,
    title,
    desc,
    href,
    label,
}: {
    step: string;
    title: string;
    desc: string;
    href: string;
    label: string;
}) {
    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step}
            </div>

            <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

            <Link
                href={href}
                className="mt-5 inline-flex rounded-2xl border border-border bg-background px-4 py-2.5 font-semibold hover:bg-muted/30"
            >
                {label}
            </Link>
        </div>
    );
}

function BenefitCard({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm font-medium">
            ✅ {text}
        </div>
    );
}
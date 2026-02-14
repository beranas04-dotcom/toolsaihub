import Link from "next/link";
import type { Tool } from "@/types";

function getDomain(url?: string) {
    if (!url) return "";
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return url.replace(/^https?:\/\//, "").split("/")[0];
    }
}

export default function FeaturedTools({ tools }: { tools: Tool[] }) {
    if (!tools?.length) return null;

    // Duplicate list to create a seamless loop
    const loop = [...tools, ...tools];

    return (
        <section className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">Featured AI Tools</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Hand-picked tools worth trying right now.
                        </p>
                    </div>

                    <Link
                        href="/tools"
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        View all →
                    </Link>
                </div>

                {/* Marquee */}
                <div
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background/40"
                    aria-label="Featured tools carousel"
                >
                    {/* gradients edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

                    <div
                        className="
              flex w-[200%] gap-5 p-5
              [animation:marquee_45s_linear_infinite]
              group-hover:[animation-play-state:paused]
              motion-reduce:animate-none
            "
                    >
                        {loop.map((t, idx) => {
                            const slug = t.slug || t.id;
                            const hasOut = Boolean(t.affiliateUrl || t.website);
                            const outHref = `/api/out?toolId=${encodeURIComponent(t.id)}`;

                            return (
                                <article
                                    key={`${t.id}-${idx}`}
                                    className="min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <Link
                                                href={`/tools/${slug}`}
                                                className="block text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {t.name}
                                            </Link>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {t.tagline || "A curated AI tool worth checking out."}
                                            </p>
                                        </div>

                                        {t.pricing ? (
                                            <span className="shrink-0 text-xs rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">
                                                {t.pricing}
                                            </span>
                                        ) : null}
                                    </div>

                                    {t.features?.length ? (
                                        <ul className="mt-4 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                                            {t.features.slice(0, 3).map((f) => (
                                                <li key={f} className="line-clamp-1">
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}

                                    <div className="mt-5 flex items-center justify-between gap-3">
                                        <div className="text-xs text-muted-foreground truncate">
                                            {t.website ? `🔗 ${getDomain(t.website)}` : ""}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={`/tools/${slug}`}
                                                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition"
                                            >
                                                Details
                                            </Link>

                                            {hasOut ? (
                                                // IMPORTANT: use <a> to avoid Next prefetch causing CORS noise
                                                <a
                                                    href={outHref}
                                                    target="_blank"
                                                    rel="sponsored noopener noreferrer"
                                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 transition"
                                                >
                                                    Visit
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                    Tip: Hover to pause. (Auto-scroll disabled if “Reduce motion” is enabled.)
                </p>
            </div>
        </section>
    );
}

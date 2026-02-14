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

    // Duplicate list for seamless loop
    const items = [...tools, ...tools];

    // Slow duration based on number of tools (more tools => a bit longer)
    const durationSec = Math.min(80, Math.max(35, tools.length * 7));

    return (
        <section className="mt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Featured AI Tools
                        </h2>
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
                    className={[
                        "relative overflow-hidden rounded-2xl border border-border bg-muted/10",
                        "py-4",
                    ].join(" ")}
                >
                    {/* Edge fade */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />

                    <div
                        className="marquee group"
                        style={
                            {
                                // @ts-ignore
                                "--marquee-duration": `${durationSec}s`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="marquee__track group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                            {items.map((t, idx) => {
                                const href = `/tools/${t.slug || t.id}`;
                                const out = t.affiliateUrl || t.website;

                                return (
                                    <article
                                        key={`${t.id}-${idx}`}
                                        className={[
                                            "w-[320px] sm:w-[360px] shrink-0",
                                            "rounded-2xl border border-border bg-card",
                                            "p-6 shadow-sm hover:shadow-md transition",
                                        ].join(" ")}
                                    >
                                        {/* Top */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link href={href} className="block">
                                                    <h3 className="text-lg font-semibold leading-snug hover:text-primary transition-colors line-clamp-1">
                                                        {t.name}
                                                    </h3>
                                                </Link>

                                                {t.tagline ? (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {t.tagline}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        Explore what this tool can do.
                                                    </p>
                                                )}
                                            </div>

                                            {t.pricing ? (
                                                <span className="shrink-0 text-xs rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">
                                                    {t.pricing}
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Chips */}
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                            {t.category ? (
                                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                    {t.category}
                                                </span>
                                            ) : null}

                                            {t.freeTrial ? (
                                                <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                                    Free trial
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Features (optional) */}
                                        {t.features?.length ? (
                                            <ul className="mt-4 text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                                {t.features.slice(0, 3).map((f) => (
                                                    <li key={f} className="line-clamp-1">
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="mt-4 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60" />
                                                    Curated pick
                                                </span>
                                            </div>
                                        )}

                                        {/* Bottom */}
                                        <div className="mt-6 flex items-center justify-between gap-3">
                                            <div className="text-xs text-muted-foreground truncate">
                                                {out ? `🔗 ${getDomain(out)}` : "No website"}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={href}
                                                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent transition"
                                                >
                                                    Details
                                                </Link>

                                                {out ? (
                                                    <Link
                                                        href={`/api/out?toolId=${t.id}`}
                                                        target="_blank"
                                                        rel="sponsored noopener noreferrer"
                                                        className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                                                    >
                                                        Visit
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Small hint */}
                <p className="mt-3 text-xs text-muted-foreground">
                    Tip: Hover to pause.{" "}
                    <span className="hidden sm:inline">
                        (Motion is disabled automatically if the user prefers reduced motion.)
                    </span>
                </p>
            </div>
        </section>
    );
}

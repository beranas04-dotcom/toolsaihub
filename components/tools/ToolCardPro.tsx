import Link from "next/link";
import type { Tool } from "@/types";

function Pill({
    children,
    variant = "neutral",
}: {
    children: React.ReactNode;
    variant?: "primary" | "neutral" | "success" | "warn";
}) {
    const cls =
        variant === "primary"
            ? "bg-primary/10 text-primary"
            : variant === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : variant === "warn"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                    : "bg-muted text-muted-foreground";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
            {children}
        </span>
    );
}

export default function ToolCardPro({ tool }: { tool: Tool }) {
    const detailsHref = `/tools/${tool.slug || tool.id}`;

    const hasVisit = Boolean(tool.affiliateUrl || tool.website);
    const visitHref = `/api/out?toolId=${tool.id}`;

    return (
        <div className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:shadow-md transition">
            {/* Title + tagline */}
            <Link href={detailsHref} className="block">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="font-semibold text-lg leading-tight group-hover:text-primary transition line-clamp-1">
                            {tool.name}
                        </div>
                        {tool.tagline ? (
                            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {tool.tagline}
                            </div>
                        ) : null}
                    </div>

                    {tool.freeTrial ? <Pill variant="success">Free trial</Pill> : null}
                </div>
            </Link>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
                {tool.category ? <Pill variant="primary">{tool.category}</Pill> : null}
                {tool.pricing ? <Pill>{tool.pricing}</Pill> : null}
                {tool.featured ? <Pill variant="warn">Featured</Pill> : null}
                {tool.verified ? <Pill>Verified</Pill> : null}
            </div>

            {/* Tags */}
            {(tool.tags || []).length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {(tool.tags || []).slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-[11px] px-2 py-1 rounded-full border border-border bg-background text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ) : null}

            {/* Actions (pro look) */}
            <div className="mt-6 flex items-center justify-between gap-3">
                {/* Open as subtle link */}
                <Link
                    href={detailsHref}
                    className="text-sm font-semibold text-muted-foreground hover:text-primary transition"
                >
                    Open →
                </Link>

                {/* Visit as primary button (only if available) */}
                {hasVisit ? (
                    <Link
                        href={visitHref}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                    >
                        Visit
                    </Link>
                ) : (
                    <span className="text-sm text-muted-foreground">No website</span>
                )}
            </div>
        </div>
    );
}

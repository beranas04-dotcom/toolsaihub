import Link from "next/link";

export default function JladanPromoBanner({
    compact = false,
}: {
    compact?: boolean;
}) {
    return (
        <div
            className={[
                "rounded-3xl border border-primary/15 bg-primary/5",
                compact ? "p-4" : "p-6",
            ].join(" ")}
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                        JLADAN Pro
                    </div>
                    <h3 className={compact ? "mt-1 text-lg font-extrabold" : "mt-2 text-2xl font-extrabold"}>
                        Want execution-ready templates and systems, not just tool discovery?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                        Get premium downloads, playbooks, and practical assets inside JLADAN.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/pricing"
                        className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-95"
                    >
                        Get JLADAN Pro
                    </Link>

                    <Link
                        href="/library"
                        className="rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                    >
                        Library
                    </Link>
                </div>
            </div>
        </div>
    );
}
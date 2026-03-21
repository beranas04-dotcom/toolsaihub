import Link from "next/link";

export default function LibraryTips() {
    return (
        <section className="mb-6 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-muted-foreground">
                    💡 Tip: The easiest way to start is by opening a system and downloading its assets.
                </div>

                <Link
                    href="/systems"
                    className="text-sm font-semibold underline hover:text-foreground"
                >
                    View Systems →
                </Link>
            </div>
        </section>
    );
}
import Link from "next/link";

export default function CTA() {
    return (
        <section className="py-16 border-t border-border bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                    <h2 className="text-3xl font-bold font-display mb-3">
                        Submit Your AI Tool
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Have an AI tool? Add it to our directory and reach creators, students, and teams.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            href="/submit"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                        >
                            Submit Tool
                        </Link>
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-muted transition font-medium"
                        >
                            Browse Tools
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

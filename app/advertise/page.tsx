import Link from "next/link";

export const metadata = {
    title: "Advertise — ToolsiaHub",
    description: "Promote your AI tool on ToolsiaHub. Sponsored placements, featured listings, and traffic tracking.",
};

export default function AdvertisePage() {
    return (
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
                <h1 className="text-3xl sm:text-4xl font-bold">Advertise on ToolsiaHub</h1>
                <p className="mt-3 text-muted-foreground text-base sm:text-lg">
                    Reach US & EU users searching for AI tools. Sponsored listings appear at the top and include click tracking.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background p-6">
                        <div className="text-sm font-semibold text-muted-foreground">Starter</div>
                        <div className="mt-2 text-3xl font-bold">$49 <span className="text-base font-semibold text-muted-foreground">/ month</span></div>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li>• Sponsored badge</li>
                            <li>• Top placement (limited)</li>
                            <li>• Click tracking (ref + UTM)</li>
                            <li>• One tool</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-6">
                        <div className="text-sm font-semibold text-muted-foreground">Pro</div>
                        <div className="mt-2 text-3xl font-bold">$99 <span className="text-base font-semibold text-muted-foreground">/ month</span></div>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li>• Higher sponsor priority</li>
                            <li>• Custom sponsor label</li>
                            <li>• Featured positioning</li>
                            <li>• Two tools</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
                    <div className="font-semibold">Contact</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Send your tool name + website + desired plan.
                    </p>

                    {/* بدل هاد الإيميل ديالك */}
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a
                            href="mailto:contact@toolsiahub.co?subject=Sponsored%20Listing"
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition"
                        >
                            Email us
                        </a>
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 font-semibold hover:bg-muted transition"
                        >
                            Browse tools
                        </Link>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        Disclosure: Sponsored listings may appear first. Affiliate commissions may apply at no extra cost to users.
                    </p>
                </div>
            </div>
        </main>
    );
}

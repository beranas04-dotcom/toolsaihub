import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Subscription — JLADAN",
    description: "Manage your JLADAN Pro subscription, billing, and invoices.",
    robots: { index: false, follow: false },
};

const PORTAL_URL =
    process.env.NEXT_PUBLIC_LEMON_PORTAL_URL || "https://lemonsqueezy.com";

export default function ManagePage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-16">
            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Manage your subscription
                </h1>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                    Update your billing details, cancel anytime, or access your invoices.
                </p>
            </div>

            {/* MAIN CARD */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
                {/* Portal */}
                <div className="rounded-2xl border border-border p-6 bg-card">
                    <h2 className="text-lg font-bold">Customer Portal</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Access your subscription dashboard to manage payments, billing,
                        and cancel your plan anytime.
                    </p>

                    <a
                        href={PORTAL_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex w-full justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95"
                    >
                        Open Portal
                    </a>

                    {!process.env.NEXT_PUBLIC_LEMON_PORTAL_URL && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Admin: set <code>NEXT_PUBLIC_LEMON_PORTAL_URL</code> in env.
                        </p>
                    )}
                </div>

                {/* Email option */}
                <div className="rounded-2xl border border-border p-6 bg-card">
                    <h2 className="text-lg font-bold">Receipt Email</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        After your purchase, you received an email from Lemon Squeezy.
                        It contains a direct link to manage your subscription.
                    </p>

                    <p className="mt-4 text-xs text-muted-foreground">
                        Search for: <strong>“JLADAN”</strong> in your inbox.
                    </p>
                </div>
            </div>

            {/* HELP SECTION */}
            <div className="mt-6 rounded-2xl border border-border p-6 bg-muted/30">
                <h2 className="text-lg font-bold">Need help?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    If you can’t access your subscription or have billing issues,
                    contact us and we’ll assist you quickly.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/contact"
                        className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                    >
                        Contact Support
                    </Link>

                    <Link
                        href="/"
                        className="rounded-xl border border-border px-5 py-3 font-semibold hover:bg-muted"
                    >
                        Back Home
                    </Link>
                </div>
            </div>

            {/* FOOTER LINKS */}
            <div className="mt-10 text-center space-y-2">
                <Link
                    href="/library"
                    className="block text-sm text-muted-foreground underline hover:text-foreground"
                >
                    ← Back to Library
                </Link>

                <Link
                    href="/pricing"
                    className="block text-sm text-muted-foreground underline hover:text-foreground"
                >
                    View Plans
                </Link>
            </div>
        </main>
    );
}
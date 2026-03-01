import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Subscription - JLADAN",
    robots: { index: false, follow: false },
};

const PORTAL_URL =
    process.env.NEXT_PUBLIC_LEMON_PORTAL_URL || "https://lemonsqueezy.com"; // fallback

export default function ManagePage() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-extrabold">Manage your subscription</h1>
            <p className="mt-3 text-muted-foreground">
                You can cancel anytime, update your payment method, or view invoices.
            </p>

            <div className="mt-8 rounded-2xl border border-border p-6 bg-muted/20">
                <h2 className="text-lg font-bold">Option 1: Customer Portal</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Open the Lemon Squeezy portal to manage your subscription.
                </p>

                <a
                    href={PORTAL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-95"
                >
                    Open Customer Portal
                </a>

                {!process.env.NEXT_PUBLIC_LEMON_PORTAL_URL && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Admin note: set <code>NEXT_PUBLIC_LEMON_PORTAL_URL</code> in Vercel env
                        to your Lemon customer portal link.
                    </p>
                )}
            </div>

            <div className="mt-6 rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold">Option 2: Use your receipt email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Lemon emails you a receipt after purchase. That email usually includes
                    a “Manage subscription” link.
                </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold">Need help?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    If you can’t find the portal link, contact support and we’ll help you.
                </p>
                <div className="mt-4 flex gap-3">
                    <Link
                        href="/"
                        className="rounded-xl border border-border px-5 py-3 font-semibold hover:bg-muted"
                    >
                        Back home
                    </Link>
                    <Link
                        href="/contact"
                        className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                    >
                        Contact support
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <Link className="underline text-sm text-muted-foreground" href="/library">
                    Back to Library
                </Link>
            </div>
        </main>
    );
}
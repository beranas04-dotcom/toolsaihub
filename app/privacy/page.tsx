import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy — JLADAN",
    description: "Privacy Policy for JLADAN (AI Premium Hub).",
};

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">
                This Privacy Policy explains how JLADAN collects, uses, and protects your information.
            </p>

            <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">1) Information we collect</h2>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                        <li>
                            <b>Account info:</b> when you sign in with Google, we receive basic account information
                            such as your email address (via Firebase Authentication).
                        </li>
                        <li>
                            <b>Subscription status:</b> we store your subscription state (e.g. active/inactive) to
                            grant access to Pro content. Payment processing is handled by Lemon Squeezy.
                        </li>
                        <li>
                            <b>Support messages:</b> if you contact us, we store your message and contact details.
                        </li>
                        <li>
                            <b>Basic usage data (optional):</b> we may log events like page views or downloads to improve
                            the product and prevent abuse.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">2) How we use your information</h2>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                        <li>To provide access to Pro pages and digital resources.</li>
                        <li>To keep your subscription access synced and working correctly.</li>
                        <li>To respond to support requests and communicate important updates.</li>
                        <li>To improve content quality, performance, and security.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">3) Payments</h2>
                    <p className="mt-2">
                        Payments and billing are processed by Lemon Squeezy. JLADAN does not store your full payment card details.
                        Lemon Squeezy may store payment details according to their policies.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">4) Sharing & third parties</h2>
                    <p className="mt-2">
                        We may share information with trusted service providers necessary to operate JLADAN (e.g. Firebase, Lemon Squeezy),
                        or when required by law.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">5) Data retention</h2>
                    <p className="mt-2">
                        We retain your account and subscription data as long as needed to provide the service, comply with legal obligations,
                        and resolve disputes.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">6) Your choices</h2>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                        <li>You can cancel your subscription anytime (see <Link className="underline" href="/manage">Manage</Link>).</li>
                        <li>You can request deletion of your account data by contacting us.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">7) Contact</h2>
                    <p className="mt-2">
                        Questions? Please use the <Link className="underline" href="/contact">contact page</Link>.
                    </p>
                </div>
            </section>
        </main>
    );
}
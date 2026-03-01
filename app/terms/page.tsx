import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service — JLADAN",
    description: "Terms of Service for JLADAN (AI Premium Hub).",
};

export default function TermsPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>

            <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
                <p>
                    By using JLADAN, you agree to these Terms. If you do not agree, please do not use the service.
                </p>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">1) The service</h2>
                    <p className="mt-2">
                        JLADAN provides access to digital resources (prompts, templates, kits) and subscription-based Pro content.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">2) Accounts</h2>
                    <p className="mt-2">
                        You are responsible for maintaining the confidentiality of your account and for all activities under your account.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">3) Subscriptions & billing</h2>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                        <li>Subscriptions renew automatically unless canceled.</li>
                        <li>Payments are processed by Lemon Squeezy.</li>
                        <li>Cancel anytime; access remains active until the end of the billing period.</li>
                    </ul>
                    <p className="mt-2">
                        Refunds are described in our <Link className="underline" href="/refund">Refund Policy</Link>.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">4) Digital products & license</h2>
                    <p className="mt-2">
                        JLADAN content is provided for your personal or internal business use. You may not resell, redistribute,
                        publicly share, or re-upload Pro content. Abuse may result in access termination.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">5) Acceptable use</h2>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                        <li>Do not attempt to bypass access controls or security measures.</li>
                        <li>Do not misuse the service or disrupt site operations.</li>
                        <li>Do not submit unlawful, harmful, or infringing content.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">6) Disclaimer</h2>
                    <p className="mt-2">
                        JLADAN is provided “as is” without warranties. We do not guarantee specific results, outcomes, or revenue.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">7) Limitation of liability</h2>
                    <p className="mt-2">
                        To the maximum extent permitted by law, JLADAN is not liable for damages arising from the use of the service.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">8) Contact</h2>
                    <p className="mt-2">
                        Questions? <Link className="underline" href="/contact">Contact us</Link>.
                    </p>
                </div>
            </section>
        </main>
    );
}
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Refund Policy — JLADAN",
    description: "Refund Policy for JLADAN subscriptions and digital products.",
};

export default function RefundPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight">Refund Policy</h1>

            <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">7-day satisfaction promise</h2>
                    <p className="mt-2">
                        If you are not satisfied with JLADAN Pro, you may request a refund within the first 7 days of your initial purchase.
                        Refunds are reviewed case-by-case to prevent abuse.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">How to request a refund</h2>
                    <p className="mt-2">
                        Please contact us via the <Link className="underline" href="/contact">contact page</Link> and include the email used at checkout.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">Cancellations</h2>
                    <p className="mt-2">
                        You can cancel anytime. Cancellation stops renewal, and access remains active until the end of the billing period.
                    </p>
                </div>
            </section>
        </main>
    );
}
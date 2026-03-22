export const metadata = {
    title: "AI Cashflow Launch Kit",
};

export default function CashflowKitPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* HERO */}
            <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                    Launch Your First AI Income Stream
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    No coding. No audience. No experience required.
                    Just proven AI systems you can execute immediately.
                </p>

                <a
                    href="#checkout"
                    className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition"
                >
                    Get Instant Access — $19
                </a>

                <p className="text-sm text-muted-foreground mt-3">
                    One-time payment • Lifetime access
                </p>
            </section>

            {/* PROBLEM */}
            <section className="bg-muted/30 py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Still Watching AI Make Other People Rich?
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Every day you see people launching AI products,
                        selling templates, building faceless channels...
                        <br /><br />
                        The problem isn’t AI.
                        <br />
                        It’s lack of a clear execution system.
                    </p>
                </div>
            </section>

            {/* PRODUCT */}
            <section className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    What You Get Inside
                </h2>

                <div className="space-y-10">

                    <div>
                        <h3 className="text-xl font-semibold mb-3">
                            🔹 AI Digital Products Machine
                        </h3>
                        <p className="text-muted-foreground">
                            Launch your own digital product in 48 hours using AI.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">
                            🔹 AI Freelance Fast-Start
                        </h3>
                        <p className="text-muted-foreground">
                            Offer AI-powered services and land your first client.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">
                            🔹 Faceless AI Monetization Blueprint
                        </h3>
                        <p className="text-muted-foreground">
                            Build income-generating content without showing your face.
                        </p>
                    </div>

                </div>
            </section>

            {/* VALUE STACK */}
            <section className="bg-muted/30 py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Total Value: $195+
                    </h2>

                    <p className="text-xl mb-4">
                        Today: <span className="font-bold text-primary">$19</span>
                    </p>

                    <a
                        id="checkout"
                        href="https://jladan-ai.lemonsqueezy.com/checkout/buy/783e0d0e-6d9d-4a81-953b-de00112ed8c6"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition"
                    >
                        Get Instant Access Now
                    </a>

                    <p className="text-sm text-muted-foreground mt-4">
                        7-Day Money-Back Guarantee
                    </p>
                </div>
            </section>
        </main>
    );
}
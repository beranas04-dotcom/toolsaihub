import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "AI Cashflow Launch Kit",
};

const previewItems = [
    {
        image: "/products/cashflow-kit/preview-1.jpg",
        alt: "AI Cashflow Launch Kit preview 1",
        badge: "Framework",
        title: "AI Business System",
        description:
            "A visual framework showing how idea, product, automation, traffic, and revenue connect inside a simple AI business model.",
    },
    {
        image: "/products/cashflow-kit/preview-2.jpg",
        alt: "AI Cashflow Launch Kit preview 2",
        badge: "Roadmap",
        title: "30 Day Launch Plan",
        description:
            "A step-by-step launch roadmap designed to help you go from idea to product execution in four simple weeks.",
    },
    {
        image: "/products/cashflow-kit/preview-3.jpg",
        alt: "AI Cashflow Launch Kit preview 3",
        badge: "Prompts",
        title: "AI Prompt Vault",
        description:
            "Ready-to-use prompt frameworks for product ideas, positioning, content planning, and faster execution.",
    },
    {
        image: "/products/cashflow-kit/preview-4.jpg",
        alt: "AI Cashflow Launch Kit preview 4",
        badge: "Strategy",
        title: "Simple Pricing Strategy",
        description:
            "A clean breakdown of how to think about offer structure, value, and pricing tiers for digital products.",
    },
    {
        image: "/products/cashflow-kit/preview-5.jpg",
        alt: "AI Cashflow Launch Kit preview 5",
        badge: "Content",
        title: "The Content Engine",
        description:
            "A practical content structure showing how educational, authority, proof, and conversion content work together.",
    },
    {
        image: "/products/cashflow-kit/preview-6.jpg",
        alt: "AI Cashflow Launch Kit preview 6",
        badge: "Clarity",
        title: "Frequently Asked Questions",
        description:
            "Clear answers that help buyers understand the format, audience, and practical use of the guide.",
    },
];

const insideItems = [
    {
        title: "25-page premium PDF guide",
        description:
            "A structured resource that walks you through AI business models, systems, and practical launch logic.",
    },
    {
        title: "AI business system framework",
        description:
            "Understand the flow from idea → product → automation → traffic → revenue.",
    },
    {
        title: "30-day launch roadmap",
        description:
            "Follow a four-week plan to validate, build, launch, and improve your first offer.",
    },
    {
        title: "Prompt Vault",
        description:
            "Ready-to-use prompts for product ideas, landing pages, lead magnets, onboarding, and automation.",
    },
    {
        title: "Traffic & content strategy",
        description:
            "Learn where traffic comes from and how to create content that supports your offer.",
    },
    {
        title: "Execution-oriented structure",
        description:
            "This is not random theory. It is designed to help you take action fast.",
    },
];

const audienceItems = [
    {
        title: "Beginners in AI business",
        description:
            "If you want a simple way to start making money with AI without coding, this kit gives you a structured path.",
    },
    {
        title: "Creators & digital product builders",
        description:
            "If you want to package ideas into sellable guides, prompts, or systems, this kit shows you how.",
    },
    {
        title: "Freelancers & solo operators",
        description:
            "If you want to use AI to create offers faster and operate with more leverage, this guide helps you build the right structure.",
    },
    {
        title: "People overwhelmed by AI tools",
        description:
            "If you are tired of random tutorials and want one clear system, this is built for you.",
    },
];

const faqItems = [
    {
        question: "Do I need coding skills?",
        answer:
            "No. This guide is designed around accessible AI tools and simple digital systems.",
    },
    {
        question: "Is this for complete beginners?",
        answer:
            "Yes. The structure is simple enough for beginners while still useful for creators and solo operators.",
    },
    {
        question: "What format do I receive?",
        answer:
            "You receive a downloadable PDF guide through your purchase account.",
    },
    {
        question: "Will a Notion workspace be included?",
        answer:
            "A companion Notion workspace may be added later as a future bonus.",
    },
];

export default function CashflowKitPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center relative">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium">
                        AI business guide + launch system
                    </div>

                    <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-[1.05] max-w-5xl mx-auto">
                        Turn AI Tools Into a
                        <span className="block text-primary mt-2">
                            Simple Digital Income System
                        </span>
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Stop consuming random AI content. Get a practical step-by-step guide
                        that shows you how to turn ideas into digital products, launch faster,
                        and build your first AI-powered income system.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="https://jladan-ai.lemonsqueezy.com/checkout/buy/783e0d0e-6d9d-4a81-953b-de00112ed8c6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-white font-semibold text-lg shadow-sm hover:opacity-90 transition min-w-[240px]"
                        >
                            Get Instant Access — $19
                        </a>

                        <Link
                            href="/downloads"
                            className="inline-flex items-center justify-center rounded-2xl border border-border px-8 py-4 font-semibold text-lg hover:bg-muted/40 transition min-w-[240px]"
                        >
                            I already purchased
                        </Link>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span>One-time payment</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Instant PDF access</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Beginner friendly</span>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto">
                        After checkout, return here and click{" "}
                        <span className="font-semibold text-foreground">I already purchased</span>{" "}
                        to access your download page instantly.
                    </p>

                    {/* TRUST / VALUE STRIP */}
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-border bg-card p-5 text-center">
                            <div className="text-2xl font-extrabold">25</div>
                            <div className="text-sm text-muted-foreground mt-1">Practical pages</div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 text-center">
                            <div className="text-2xl font-extrabold">30</div>
                            <div className="text-sm text-muted-foreground mt-1">Day roadmap</div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 text-center">
                            <div className="text-2xl font-extrabold">AI</div>
                            <div className="text-sm text-muted-foreground mt-1">Prompt systems</div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 text-center">
                            <div className="text-2xl font-extrabold">$19</div>
                            <div className="text-sm text-muted-foreground mt-1">One-time access</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT IS IT */}
            <section className="py-16 border-y border-border bg-muted/30">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold">What is the AI Cashflow Launch Kit?</h2>

                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                        AI Cashflow Launch Kit is a practical digital guide designed to help you
                        launch a simple AI-powered online income system. Inside, you get a structured
                        PDF with business models, tool recommendations, launch steps, prompts,
                        traffic strategies, and execution frameworks you can apply immediately.
                    </p>
                </div>
            </section>

            {/* WHO IT'S FOR */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">Who this is for</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {audienceItems.map((item) => (
                        <div key={item.title} className="border rounded-2xl p-6 bg-card">
                            <h3 className="text-xl font-semibold">{item.title}</h3>
                            <p className="mt-3 text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHAT'S INSIDE */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">What’s inside the kit</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {insideItems.map((item) => (
                            <div key={item.title} className="border rounded-2xl p-6 bg-background">
                                <h3 className="text-xl font-semibold">{item.title}</h3>
                                <p className="mt-3 text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PREVIEW */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm text-primary font-medium">
                        Product preview
                    </div>

                    <h2 className="mt-5 text-3xl md:text-4xl font-bold">
                        See what’s inside before you buy
                    </h2>

                    <p className="mt-4 text-muted-foreground text-lg">
                        Preview selected pages from the AI Cashflow Launch Kit and get a clear look
                        at the frameworks, launch steps, and prompt systems included inside.
                    </p>
                </div>

                <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {previewItems.map((item) => (
                        <div
                            key={item.title}
                            className="group border rounded-3xl overflow-hidden bg-card shadow-sm hover:shadow-md transition"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.alt}
                                    fill
                                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                                />
                            </div>

                            <div className="p-5">
                                <div className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                                    {item.badge}
                                </div>

                                <h3 className="mt-3 text-xl font-semibold">
                                    {item.title}
                                </h3>

                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                        These preview pages are included to help you evaluate the structure,
                        clarity, and practical value of the product before purchase.
                    </p>
                </div>
            </section>

            {/* AFTER PURCHASE */}
            <section className="py-16 border-y border-border bg-muted/30">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold">What happens after purchase?</h2>

                    <div className="mt-10 grid md:grid-cols-3 gap-6 text-left">
                        <div className="border rounded-2xl p-6 bg-background">
                            <h3 className="text-xl font-semibold">1. Complete checkout</h3>
                            <p className="mt-3 text-muted-foreground">
                                Purchase the product securely through Lemon Squeezy.
                            </p>
                        </div>

                        <div className="border rounded-2xl p-6 bg-background">
                            <h3 className="text-xl font-semibold">2. Access your files</h3>
                            <p className="mt-3 text-muted-foreground">
                                Return to the downloads page and access your product instantly.
                            </p>
                        </div>

                        <div className="border rounded-2xl p-6 bg-background">
                            <h3 className="text-xl font-semibold">3. Start building</h3>
                            <p className="mt-3 text-muted-foreground">
                                Use the PDF to plan, launch, and improve your first AI-powered offer.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>

                <div className="space-y-6">
                    {faqItems.map((item) => (
                        <div key={item.question} className="border rounded-2xl p-6">
                            <h3 className="text-xl font-semibold">{item.question}</h3>
                            <p className="mt-3 text-muted-foreground">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="pb-24 text-center max-w-4xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">
                    Get the AI Cashflow Launch Kit today
                </h2>

                <p className="mt-4 text-muted-foreground text-lg">
                    Start with a clear system instead of random AI advice.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="https://jladan-ai.lemonsqueezy.com/checkout/buy/783e0d0e-6d9d-4a81-953b-de00112ed8c6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition"
                    >
                        Get Instant Access — $19
                    </a>

                    <Link
                        href="/downloads"
                        className="inline-block border border-border px-8 py-4 rounded-xl font-semibold text-lg hover:bg-muted/40 transition"
                    >
                        I already purchased
                    </Link>
                </div>
            </section>
        </main>
    );
}
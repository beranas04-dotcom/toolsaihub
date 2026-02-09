import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Affiliate Disclosure — AIToolsHub',
    description: 'Learn about our affiliate partnerships and how we maintain editorial independence while recommending AI tools.',
    openGraph: {
        title: 'Affiliate Disclosure — AIToolsHub',
        description: 'Learn about our affiliate partnerships and how we maintain editorial independence while recommending AI tools.',
    },
};

export default function DisclosurePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Affiliate Disclosure</h1>

            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground mb-8">
                    Last updated: January 28, 2026
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Our Commitment to Transparency</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        AIToolsHub is committed to providing honest, unbiased reviews and recommendations of AI tools.
                        This page explains our affiliate relationships and how we maintain editorial independence.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Affiliate Links</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        AIToolsHub participates in various affiliate marketing programs. This means that when you click
                        on certain links on our website and make a purchase, we may receive a commission at no additional
                        cost to you.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        These affiliate links help support our work and allow us to continue providing free, high-quality
                        content and tool recommendations to our community.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Editorial Independence</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        <strong>Affiliate commissions do not influence our rankings, reviews, or recommendations.</strong>
                        Our editorial team evaluates and ranks AI tools based solely on their features, performance,
                        user experience, value, and overall quality.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        We feature tools that we believe provide genuine value to our users, regardless of whether
                        they offer affiliate programs. Many tools listed on AIToolsHub do not have affiliate partnerships
                        with us, yet we recommend them because they are excellent products.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">How We Evaluate Tools</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        Our review process is thorough and objective. We evaluate AI tools based on:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/90">
                        <li>Feature set and capabilities</li>
                        <li>Ease of use and user interface</li>
                        <li>Performance and reliability</li>
                        <li>Pricing and value for money</li>
                        <li>Customer support and documentation</li>
                        <li>User reviews and community feedback</li>
                    </ul>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        The presence or absence of an affiliate relationship has no bearing on these evaluations.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Trust Matters</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        We understand that trust is earned, not given. That's why we're transparent about our affiliate
                        relationships and committed to providing honest recommendations that serve your best interests.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        If you ever feel that a recommendation is biased or inaccurate, we want to hear from you.
                        Your feedback helps us improve and maintain the highest standards of integrity.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Questions or Concerns?</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        If you have any questions about our affiliate relationships, editorial policies, or specific
                        tool recommendations, please don't hesitate to contact us.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        <strong>Contact us:</strong>{' '}
                        <a
                            href="mailto:aitoolshub.contact@gmail.com"
                            className="text-primary hover:underline"
                        >
                            aitoolshub.contact@gmail.com
                        </a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">FTC Compliance</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        In accordance with the Federal Trade Commission (FTC) guidelines, we disclose that some of
                        the links on this website are affiliate links. We are in compliance with the FTC's requirements
                        concerning the use of endorsements and testimonials in advertising.
                    </p>
                </section>

                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                        Thank you for supporting AIToolsHub. Your trust and engagement make our work possible.
                    </p>
                    <div className="text-center mt-6">
                        <Link
                            href="/"
                            className="text-primary hover:underline font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

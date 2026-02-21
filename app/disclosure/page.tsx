import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Affiliate Disclosure — AIToolsHub',
    description: 'Learn about our affiliate partnerships, sponsored listings, and how we maintain editorial independence while recommending AI tools.',
    keywords: ['affiliate disclosure', 'AI tools', 'sponsored listings', 'AIToolsHub transparency'],
    openGraph: {
        title: 'Affiliate Disclosure — AIToolsHub',
        description: 'Learn about our affiliate partnerships and how we maintain editorial independence while recommending AI tools.',
        url: 'https://aitoolshub.co/disclosure',
        siteName: 'AIToolsHub',
        type: 'website',
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

                {/* Transparency */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Our Commitment to Transparency</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        AIToolsHub is committed to providing honest, unbiased reviews and recommendations of AI tools.
                        This page explains our affiliate relationships, sponsored listings, and how we maintain editorial independence.
                    </p>
                </section>

                {/* Affiliate Links */}
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

                {/* Sponsored Listings */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Sponsored Listings</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        Some tools may appear as <strong>featured or sponsored listings</strong>. These placements are clearly
                        identified and may be promoted for a limited time.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        While sponsorship may influence visibility (such as position or highlighting),
                        it does not affect our evaluation criteria or editorial integrity.
                    </p>
                </section>

                {/* Editorial Independence */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Editorial Independence</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        <strong>Affiliate commissions and sponsorships do not influence our rankings, reviews, or recommendations.</strong>
                        Our editorial approach prioritizes real value to users.
                    </p>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        We feature tools based on their quality, usefulness, and user experience — regardless of whether
                        they offer affiliate programs.
                    </p>
                </section>

                {/* Evaluation */}
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
                </section>

                {/* How we make money */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">How AIToolsHub Makes Money</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        AIToolsHub generates revenue through affiliate partnerships, sponsored placements,
                        and advertising. This allows us to keep the platform free for users while continuing
                        to improve our content and features.
                    </p>
                </section>

                {/* Trust */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Trust Matters</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        We understand that trust is earned, not given. That's why we are transparent about how we operate
                        and how we generate revenue.
                    </p>
                </section>

                {/* Contact */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Questions or Concerns?</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        If you have any questions about our policies or recommendations, feel free to reach out.
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

                {/* FTC */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">FTC Compliance</h2>
                    <p className="text-foreground/90 leading-relaxed mb-4">
                        In accordance with the Federal Trade Commission (FTC) guidelines, we disclose that some links
                        on this website are affiliate links. We comply with all applicable regulations regarding endorsements.
                    </p>
                </section>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                        Thank you for supporting AIToolsHub. Your trust makes our work possible.
                    </p>

                    <div className="text-center mt-6 space-x-4">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            ← Back to Home
                        </Link>
                        <Link href="/contact" className="text-primary hover:underline font-medium">
                            Contact Us →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

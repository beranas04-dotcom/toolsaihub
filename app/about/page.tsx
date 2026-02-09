import { Metadata } from 'next';
import { siteMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = {
    title: 'About Us - AIToolsHub',
    description: 'Learn about our mission to help creators, developers, and businesses find the best AI tools.',
};

export default function AboutPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8 font-display">About {siteMetadata.siteName}</h1>

            <div className="prose prose-lg dark:prose-invert">
                <p className="lead text-xl text-muted-foreground mb-8">
                    We are dedicated to demystifying Artificial Intelligence and making powerful tools accessible to everyone.
                </p>

                <h2>Our Mission</h2>
                <p>
                    The AI landscape is evolving at a breakneck pace. Every day, new tools are released that claim to revolutionize how we work and create. But with so many options, finding the <em>right</em> tool can be overwhelming.
                </p>
                <p>
                    At <strong>AIToolsHub</strong>, our mission is simple: to curate, test, and review the best AI software available, so you can save time and focus on what matters most—building great things.
                </p>

                <h2>Who We Are For</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Creators</strong> looking to streamline their content production.</li>
                    <li><strong>Developers</strong> seeking coding assistants and automation tools.</li>
                    <li><strong>Marketers</strong> who want to leverage data and AI for better campaigns.</li>
                    <li><strong>Students</strong> aiming to enhance their learning and research.</li>
                    <li><strong>Businesses</strong> optimizing operations with intelligent software.</li>
                </ul>

                <h2>Why Trust Us?</h2>
                <p>
                    We operate independently. While we may earn affiliate commissions from some of the links on our site (which helps keep the lights on), our recommendations are driven by functionality, user experience, and value. We test tools extensively to ensure they deliver on their promises.
                </p>

                <p>
                    Thank you for being part of our community. If you have any feedback or want to suggest a tool, please don't hesitate to reach out.
                </p>
            </div>
        </main>
    );
}

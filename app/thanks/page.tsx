import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thank You - AIToolsHub',
    description: 'Thanks for subscribing to our newsletter.',
    robots: {
        index: false,
        follow: false,
    }
};

export default function ThanksPage() {
    return (
        <main className="container mx-auto px-4 py-24 max-w-2xl text-center">
            <div className="bg-green-50 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                ✉️
            </div>
            <h1 className="text-4xl font-bold mb-6 font-display">You're on the list!</h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Thanks for subscribing. Check your inbox soon for the latest AI tools and updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/tools"
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Browse Tools
                </Link>
                <Link
                    href="/"
                    className="bg-card border border-input px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}

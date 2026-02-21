import { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
    title: 'Contact Us - AIToolsHub',
    description: 'Get in touch with the AIToolsHub team for inquiries, feedback, or partnerships.',
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ContactPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 font-display">Contact Us</h1>
            <p className="text-muted-foreground mb-8 text-lg">
                Have questions, suggestions, or want to partner with us? We'd love to hear from you.
            </p>

            <ContactForm />

            <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                    Alternatively, email us directly at
                </p>
                <a
                    href="mailto:aitoolshub.contact@gmail.com"
                    className="text-primary font-medium hover:underline text-lg inline-flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    aitoolshub.contact@gmail.com
                </a>
            </div>
        </main>
    );
}

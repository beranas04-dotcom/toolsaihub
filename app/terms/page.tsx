export const metadata = {
    title: "Terms of Service | AIToolsHub",
    description: "Terms of Service for AIToolsHub.",
};

export default function TermsPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>

            <section className="mt-8 space-y-4 text-sm text-gray-300">
                <p>
                    By using AIToolsHub, you agree to these Terms. If you do not agree, please do not use the site.
                </p>

                <h2 className="text-xl font-semibold text-white">Use of the site</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Do not misuse the site or attempt to disrupt service.</li>
                    <li>Do not submit unlawful or harmful content.</li>
                </ul>

                <h2 className="text-xl font-semibold text-white">Content & listings</h2>
                <p>
                    Tool listings and information may change. We do not guarantee accuracy or availability of third-party tools.
                </p>

                <h2 className="text-xl font-semibold text-white">Limitation of liability</h2>
                <p>
                    AIToolsHub is provided “as is” without warranties. We are not liable for damages arising from use of the site.
                </p>

                <h2 className="text-xl font-semibold text-white">Contact</h2>
                <p>
                    Questions? <a className="underline" href="/contact">Contact us</a>.
                </p>
            </section>
        </main>
    );
}

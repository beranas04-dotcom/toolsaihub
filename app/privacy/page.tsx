export const metadata = {
    title: "Privacy Policy | AIToolsHub",
    description: "Privacy Policy for AIToolsHub.",
};

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>

            <p className="mt-6 text-sm text-gray-300">
                This Privacy Policy explains how AIToolsHub collects, uses, and protects your information.
            </p>

            <section className="mt-10 space-y-4 text-sm text-gray-300">
                <h2 className="text-xl font-semibold text-white">Information we collect</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Information you submit via forms (e.g., contact requests).</li>
                    <li>Basic analytics data (pages visited, device type), if enabled.</li>
                </ul>

                <h2 className="text-xl font-semibold text-white">How we use it</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To respond to your messages and provide support.</li>
                    <li>To improve site performance and user experience.</li>
                </ul>

                <h2 className="text-xl font-semibold text-white">Affiliate disclosure</h2>
                <p>
                    Some links on this site may be affiliate links. If you purchase through them,
                    AIToolsHub may earn a commission at no extra cost to you.
                </p>

                <h2 className="text-xl font-semibold text-white">Contact</h2>
                <p>
                    If you have questions, use the <a className="underline" href="/contact">contact page</a>.
                </p>
            </section>
        </main>
    );
}

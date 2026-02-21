export const metadata = {
    title: "Support | AIToolsHub",
    description: "Support page for AIToolsHub.",
};

export default function SupportPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-bold tracking-tight">Support</h1>
            <p className="mt-6 text-sm text-gray-300">
                Need help? Send us a message and we’ll get back to you.
            </p>
            <div className="mt-6">
                <a className="underline text-sm" href="/contact">Go to Contact</a>
            </div>
        </main>
    );
}

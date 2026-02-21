export const metadata = {
    title: "Changelog | AIToolsHub",
    description: "Product updates and changelog for AIToolsHub.",
};

export default function ChangelogPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
            <div className="mt-8 space-y-4 text-sm text-gray-300">
                <div className="rounded-xl border border-white/10 p-5">
                    <p className="text-white font-semibold">v1.0</p>
                    <p className="mt-2">Initial release of AIToolsHub.</p>
                </div>
            </div>
        </main>
    );
}

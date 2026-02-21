import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Documentation - AIToolsHub",
    description: "API documentation for AIToolsHub.",
};

export default function ApiDocsPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 font-display">API Documentation</h1>
            <p className="text-muted-foreground text-lg mb-8">
                Documentation will be available soon.
            </p>

            <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold mb-2">Status</h2>
                <p className="text-muted-foreground">
                    This page is a placeholder so the build succeeds. You can replace it later with real docs.
                </p>
            </section>
        </main>
    );
}

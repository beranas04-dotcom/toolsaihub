export const metadata = {
    title: "Documentation | AIToolsHub",
    description: "Documentation and guides for AIToolsHub.",
};

export default function DocsPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="mt-6 text-sm text-muted-foreground">
                Guides and documentation will be published here soon.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
                <p className="text-sm">
                    Need something specific?{" "}
                    <a className="underline" href="/contact">
                        Contact us
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}

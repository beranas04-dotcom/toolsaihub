export default function Stats({ toolCount }: { toolCount: number }) {
    return (
        <section className="py-10 text-center border-b border-border bg-background">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
                Freshly curated every week
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
                Explore <span className="text-primary">{toolCount}</span> hand-picked AI tools
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Search by category, compare pricing, and find the fastest tool for your exact use case.
            </p>
        </section>
    );
}

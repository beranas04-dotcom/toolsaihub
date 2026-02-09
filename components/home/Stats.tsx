export default function Stats({ toolCount }: { toolCount: number }) {
    return (
        <section className="py-8 text-center">
            <p className="text-lg font-medium">
                We currently list <span className="text-primary font-bold">{toolCount}</span> AI tools.
            </p>
        </section>
    );
}

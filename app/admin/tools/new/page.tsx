import ToolForm from "./tool-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewToolPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold">Create Tool</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Add a new AI tool to your directory with affiliate and publishing settings.
                </p>
            </div>

            <ToolForm />
        </main>
    );
}
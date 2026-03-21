import ToolsAdmin from "./tools-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminToolsPage() {
    return (
        <main className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold">Manage Tools</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Edit, feature, publish, and delete AI tools from your directory.
                    </p>
                </div>

                <a
                    href="/admin/tools/new"
                    className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-95"
                >
                    + New tool
                </a>
            </div>

            <ToolsAdmin />
        </main>
    );
}
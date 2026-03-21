import CategoriesAdmin from "./categories-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
    return (
        <main className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold">Manage Categories</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Create, edit, publish, sort, and delete categories for your AI tools directory.
                    </p>
                </div>
            </div>

            <CategoriesAdmin />
        </main>
    );
}
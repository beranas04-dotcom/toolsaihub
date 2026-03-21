import SubmissionsAdmin from "./submissions-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminSubmissionsPage() {
    return (
        <main className="max-w-6xl mx-auto px-6 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold">Tool Submissions</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Review, approve, or reject submitted AI tools.
                </p>
            </div>

            <SubmissionsAdmin />
        </main>
    );
}
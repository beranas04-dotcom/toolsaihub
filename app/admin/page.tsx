import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
    const user = await getServerSessionUser();

    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    return (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/tools"
                        className="px-4 py-2 rounded-lg bg-muted font-semibold hover:bg-muted/80"
                    >
                        Manage Tools
                    </Link>
                    <Link
                        href="/admin/tools/new"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    >
                        + Add New Tool
                    </Link>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                    href="/admin/tools"
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition"
                >
                    <div className="font-medium">Tools</div>
                    <div className="text-xs text-muted-foreground">Approve / Reject / Edit</div>
                </Link>

                <Link
                    href="/admin/tools/new"
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition"
                >
                    <div className="font-medium">New Tool</div>
                    <div className="text-xs text-muted-foreground">Create a tool entry</div>
                </Link>

                <Link
                    href="/admin/reviews"
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition"
                >
                    <div className="font-medium">Reviews</div>
                    <div className="text-xs text-muted-foreground">Moderate reviews</div>
                </Link>

                <Link
                    href="/admin/submissions"
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition"
                >
                    <div className="font-medium">Submissions</div>
                    <div className="text-xs text-muted-foreground">Approve submitted tools</div>
                </Link>
            </div>
        </main>
    );
}

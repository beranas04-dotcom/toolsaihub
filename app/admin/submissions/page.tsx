import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSessionUser } from "@/lib/admin-session";
import { listSubmissions } from "@/lib/admin-submissions";
import SubmissionsClient from "./SubmissionsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSubmissionsPage() {
    const user = await getServerSessionUser();

    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    const submissions = await listSubmissions();

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin — Tool Submissions</h1>
                    <p className="text-muted-foreground mt-2">
                        Review new tools submitted by users.
                    </p>
                </div>
                <Link href="/" className="text-sm font-medium text-primary hover:underline">
                    ← Back to site
                </Link>
            </div>

            <SubmissionsClient initial={submissions} />
        </main>
    );
}

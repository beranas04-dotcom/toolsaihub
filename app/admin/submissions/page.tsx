import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

import { getServerSessionUser } from "@/lib/admin-session";
import { listSubmissions, updateSubmissionStatus } from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSubmissionsPage() {
    const user = await getServerSessionUser();

    // Not logged in or not admin
    if (!user?.isAdmin) {
        redirect("/auth/signin");
    }

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
                <Link
                    href="/"
                    className="text-sm font-medium text-primary hover:underline"
                >
                    ← Back to site
                </Link>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-muted/30 border border-border rounded-xl p-10 text-center">
                    <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
                    <p className="text-muted-foreground">
                        When users submit tools, they will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((s) => (
                        <div
                            key={s.id}
                            className="bg-card border border-border rounded-xl p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-xl font-bold">{s.toolName}</h2>
                                        <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">
                                            {s.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground mt-2">
                                        <div>
                                            <span className="font-medium">Website:</span>{" "}
                                            <a
                                                href={s.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {s.websiteUrl}
                                            </a>
                                        </div>
                                        <div className="mt-1">
                                            <span className="font-medium">Category:</span>{" "}
                                            {s.category || "—"}
                                        </div>
                                        <div className="mt-1">
                                            <span className="font-medium">Submitter:</span>{" "}
                                            {s.submitterEmail || "—"}
                                        </div>
                                    </div>

                                    {s.description ? (
                                        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                                            {s.description}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex gap-2">
                                    <form
                                        action={async () => {
                                            "use server";
                                            await updateSubmissionStatus(s.id, "approved");
                                        }}
                                    >
                                        <button
                                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                                            type="submit"
                                        >
                                            Approve
                                        </button>
                                    </form>

                                    <form
                                        action={async () => {
                                            "use server";
                                            await updateSubmissionStatus(s.id, "rejected");
                                        }}
                                    >
                                        <button
                                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                                            type="submit"
                                        >
                                            Reject
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-muted-foreground">
                                Created: {new Date(s.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

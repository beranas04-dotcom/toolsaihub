import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { getServerSessionUser } from "@/lib/admin-session";
import {
    listSubmissions,
    approveSubmission,
    rejectSubmission,
} from "@/lib/admin-submissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSubmissionsPage() {
    const user = await getServerSessionUser();

    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    const submissions = await listSubmissions();

    async function approveAction(formData: FormData) {
        "use server";
        const id = String(formData.get("id") || "");
        const u = await getServerSessionUser();
        if (!u) throw new Error("UNAUTHENTICATED");
        if (!u.isAdmin) throw new Error("FORBIDDEN");

        await approveSubmission({
            submissionId: id,
            moderatorUid: u.uid,
            moderatorEmail: u.email,
        });

        revalidatePath("/admin/submissions");
        revalidatePath("/admin/tools");
    }

    async function rejectAction(formData: FormData) {
        "use server";
        const id = String(formData.get("id") || "");
        const reason = String(formData.get("reason") || "");
        const u = await getServerSessionUser();
        if (!u) throw new Error("UNAUTHENTICATED");
        if (!u.isAdmin) throw new Error("FORBIDDEN");

        await rejectSubmission({
            submissionId: id,
            moderatorUid: u.uid,
            moderatorEmail: u.email,
            reason,
        });

        revalidatePath("/admin/submissions");
    }

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin — Tool Submissions</h1>
                    <p className="text-muted-foreground mt-2">
                        Review tools submitted by users. Approving will create a draft tool entry.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Dashboard
                    </Link>
                    <Link
                        href="/admin/tools"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Tools →
                    </Link>
                </div>
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
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-xl font-bold">{s.toolName}</h2>
                                        <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border">
                                            {s.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
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
                                        <div>
                                            <span className="font-medium">Category:</span>{" "}
                                            {s.category || "—"}
                                        </div>
                                        <div>
                                            <span className="font-medium">Submitter:</span>{" "}
                                            {s.submitterEmail || "—"}
                                        </div>
                                        <div className="text-xs">
                                            Created: {new Date(s.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {s.description ? (
                                        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                                            {s.description}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-2 w-full lg:w-[240px]">
                                    <form action={approveAction} className="w-full">
                                        <input type="hidden" name="id" value={s.id} />
                                        <button
                                            className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                                            type="submit"
                                        >
                                            Approve → Create Tool
                                        </button>
                                    </form>

                                    <form action={rejectAction} className="w-full space-y-2">
                                        <input type="hidden" name="id" value={s.id} />
                                        <input
                                            name="reason"
                                            placeholder="Reject reason (optional)"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                        />
                                        <button
                                            className="w-full px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                                            type="submit"
                                        >
                                            Reject
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

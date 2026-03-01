import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Welcome to JLADAN Pro",
    description: "Your subscription is being activated. Access your Pro Library now.",
    robots: { index: false, follow: false },
};

async function getSubStatus() {
    try {
        // ✅ IMPORTANT: use relative URL so cookies are included on the server
        const res = await fetch("/api/subscription/status", { cache: "no-store" });

        if (!res.ok) return { ok: false, status: "none" as const };
        const data = (await res.json()) as { ok: boolean; status: string };
        return data;
    } catch {
        return { ok: false, status: "none" as const };
    }
}

export default async function ThanksPage() {
    const data = await getSubStatus();
    const isActive = data?.status === "active";

    return (
        <main className="max-w-3xl mx-auto px-4 py-20">
            <section className="text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-green-50 dark:bg-green-900/20">
                    ✅
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Welcome to JLADAN Pro
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground">
                    Your checkout is complete. Your Pro access should activate in a few seconds.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span
                        className={[
                            "h-2 w-2 rounded-full",
                            isActive ? "bg-green-500" : "bg-yellow-500",
                        ].join(" ")}
                    />
                    <span className="text-muted-foreground">
                        {isActive
                            ? "Status: Active"
                            : "Status: Activating… (refresh in 10–20 seconds)"}
                    </span>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/library"
                        className="rounded-xl bg-primary px-8 py-3 font-semibold text-white hover:opacity-95 text-center"
                    >
                        Go to Library
                    </Link>

                    <Link
                        href="/pro"
                        className="rounded-xl border border-border px-8 py-3 font-semibold hover:bg-muted text-center"
                    >
                        Open Pro Dashboard
                    </Link>
                </div>

                <div className="mt-4">
                    <Link
                        href="/manage"
                        className="text-sm text-muted-foreground underline hover:text-foreground"
                    >
                        Manage subscription
                    </Link>
                </div>

                <div className="mt-10 mx-auto max-w-xl text-left rounded-2xl border border-border p-6 bg-muted/20">
                    <h2 className="text-lg font-bold">What to do next</h2>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>• Open the Library and download your first Pro kit/template.</li>
                        <li>• If access is still “Activating…”, refresh in 10–20 seconds.</li>
                        <li>• Need help? Contact support from the site footer.</li>
                    </ul>
                </div>

                <p className="mt-8 text-xs text-muted-foreground">
                    If you have issues, try logging out and signing in again to refresh your session.
                </p>
            </section>
        </main>
    );
}
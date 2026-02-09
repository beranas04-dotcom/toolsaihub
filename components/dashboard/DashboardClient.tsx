"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

type Item = {
    id: string;
    toolId: string;
    toolName?: string;
    rating: number;
    title?: string;
    text?: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: string | null;
};

type Tab = "overview" | "reviews" | "saved" | "settings";

function TabButton({
    active,
    href,
    children,
}: {
    active: boolean;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-semibold transition ${active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
        >
            {children}
        </Link>
    );
}

function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string | number;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
            {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
        </div>
    );
}

function Skeleton() {
    return (
        <div className="space-y-4">
            <div className="h-10 rounded-xl bg-muted/40" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-28 rounded-2xl bg-muted/40" />
                <div className="h-28 rounded-2xl bg-muted/40" />
                <div className="h-28 rounded-2xl bg-muted/40" />
                <div className="h-28 rounded-2xl bg-muted/40" />
            </div>
            <div className="h-40 rounded-2xl bg-muted/40" />
        </div>
    );
}

export default function DashboardClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const tab = (sp.get("tab") || "overview") as Tab;

    const { user, loading: authLoading, signOut } = useAuth();

    const [email, setEmail] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setErr(null);
                setLoading(true);

                // Wait auth provider first
                if (authLoading) return;

                if (!user) {
                    router.replace("/auth/signin");
                    return;
                }

                setEmail(user.email || null);

                // counts from user reviews
                const u = auth.currentUser;
                if (!u) {
                    router.replace("/auth/signin");
                    return;
                }

                const token = await u.getIdToken();
                const res = await fetch("/api/my-reviews", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Failed to load dashboard data.");

                setItems(Array.isArray(data.items) ? data.items : []);
            } catch (e: any) {
                setErr(e?.message || "Error");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [router, user, authLoading]);

    const stats = useMemo(() => {
        const total = items.length;
        const approved = items.filter((r) => r.status === "approved").length;
        const pending = items.filter((r) => r.status === "pending").length;
        const rejected = items.filter((r) => r.status === "rejected").length;

        const avg =
            total > 0 ? items.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total : 0;

        return { total, approved, pending, rejected, avg };
    }, [items]);

    const tabs: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "reviews", label: "My Reviews" },
        { key: "saved", label: "Saved Tools" },
        { key: "settings", label: "Settings" },
    ];

    return (
        <main className="container mx-auto px-6 py-10 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {email ? (
                            <>
                                Signed in as <span className="font-semibold text-foreground">{email}</span>
                            </>
                        ) : (
                            "Your account overview."
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/tools"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/60 transition font-semibold"
                    >
                        Browse tools →
                    </Link>
                    <Link
                        href="/submit"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition font-semibold"
                    >
                        Submit tool →
                    </Link>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await signOut();
                                router.replace("/");
                            } catch { }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition font-semibold"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((t) => (
                    <TabButton key={t.key} active={tab === t.key} href={`/dashboard?tab=${t.key}`}>
                        {t.label}
                    </TabButton>
                ))}
            </div>

            {loading ? <Skeleton /> : null}
            {err ? <div className="text-sm text-red-500">{err}</div> : null}

            {!loading && !err ? (
                <>
                    {tab === "overview" ? (
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total reviews" value={stats.total} />
                                <StatCard label="Approved" value={stats.approved} hint="Visible on tool pages" />
                                <StatCard label="Pending" value={stats.pending} hint="Waiting for admin approval" />
                                <StatCard label="Avg rating" value={stats.avg.toFixed(1)} hint="Across your reviews" />
                            </div>

                            {/* Admin shortcuts */}
                            {user?.isAdmin ? (
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold">Admin</h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Moderate tools and reviews.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                href="/admin"
                                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition font-semibold"
                                            >
                                                Admin panel →
                                            </Link>
                                            <Link
                                                href="/admin/reviews"
                                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                                            >
                                                Review moderation →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="rounded-2xl border border-border bg-card p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold">Quick actions</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            دير review جديدة أو رجّع لصفحة reviews ديالك.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            href="/tools"
                                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                                        >
                                            Write a review →
                                        </Link>
                                        <Link
                                            href="/my-reviews"
                                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition font-semibold"
                                        >
                                            View my reviews →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-xl font-bold mb-2">Latest activity</h2>
                                <p className="text-sm text-muted-foreground mb-4">آخر reviews ديالك (آخر 5).</p>

                                {items.length === 0 ? (
                                    <div className="rounded-xl border border-border bg-background p-5 text-sm text-muted-foreground">
                                        مازال ما عندك حتى review. سر لصفحة tools وكتب أول review.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {items.slice(0, 5).map((r) => (
                                            <Link
                                                key={r.id}
                                                href={`/tools/${r.toolId}#reviews`}
                                                className="block rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:shadow-sm transition"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="font-semibold line-clamp-1">{r.toolName || r.toolId}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                            {r.title || "Review"}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground shrink-0">{r.status}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {tab === "reviews" ? (
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold">My Reviews</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        فتح صفحة reviews ديالك.
                                    </p>
                                </div>
                                <Link
                                    href="/my-reviews"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                                >
                                    Open My Reviews →
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {tab === "saved" ? (
                        <div className="rounded-2xl border border-border bg-card p-8">
                            <h2 className="text-xl font-bold mb-2">Saved Tools</h2>
                            <p className="text-sm text-muted-foreground mb-5">
                                (قريباً) غادي نزيدو “Save tool” باش user يحفظ الأدوات اللي عجباتو.
                            </p>
                            <Link
                                href="/tools"
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition font-semibold"
                            >
                                Browse tools →
                            </Link>
                        </div>
                    ) : null}

                    {tab === "settings" ? (
                        <div className="rounded-2xl border border-border bg-card p-8">
                            <h2 className="text-xl font-bold mb-2">Settings</h2>
                            <p className="text-sm text-muted-foreground mb-5">
                                (قريباً) تقدر تبدّل الاسم، الصورة، وتفضيلات الإيميل.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition font-semibold"
                                >
                                    Contact support →
                                </Link>
                                <Link
                                    href="/tools"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                                >
                                    Discover tools →
                                </Link>
                            </div>
                        </div>
                    ) : null}
                </>
            ) : null}
        </main>
    );
}

import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getDashboardData() {
    const db = getAdminDb();

    const [
        toolsCountSnap,
        usersCountSnap,
        productsCountSnap,
        systemsCountSnap,
        submissionsCountSnap,
        clicksCountSnap,
        downloadsCountSnap,
        topToolsSnap,
        recentSubmissionsSnap,
        sponsorshipsSnap,
        sponsoredToolsSnap,
    ] = await Promise.all([
        db.collection("tools").count().get().catch(() => null),
        db.collection("users").count().get().catch(() => null),
        db.collection("products").count().get().catch(() => null),
        db.collection("systems").count().get().catch(() => null),
        db.collection("tool_submissions").count().get().catch(() => null),
        db.collection("clicks").count().get().catch(() => null),
        db.collection("download_logs").count().get().catch(() => null),

        db.collection("tools").orderBy("clicks", "desc").limit(5).get().catch(() => null),
        db.collection("tool_submissions").orderBy("createdAt", "desc").limit(5).get().catch(() => null),

        db.collection("sponsorship_requests").orderBy("createdAt", "desc").limit(200).get().catch(() => null),
        db.collection("tools").where("sponsored", "==", true).limit(200).get().catch(() => null),
    ]);

    const sponsorshipItems =
        sponsorshipsSnap?.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
        })) || [];

    const now = Date.now();

    const sponsorshipStats = {
        total: sponsorshipItems.length,
        pendingPayment: sponsorshipItems.filter((x: any) => x.status === "pending_payment").length,
        paid: sponsorshipItems.filter((x: any) => x.status === "paid").length,
        approved: sponsorshipItems.filter((x: any) => x.status === "approved").length,
        rejected: sponsorshipItems.filter((x: any) => x.status === "rejected").length,
    };

    const activeSponsoredTools =
        sponsoredToolsSnap?.docs.filter((d) => {
            const data = d.data() as any;
            if (!data?.sponsored) return false;
            if (!data?.sponsorUntil) return true;

            const ms = Date.parse(String(data.sponsorUntil));
            if (!Number.isFinite(ms)) return false;

            return ms > now;
        }).length || 0;

    return {
        stats: {
            tools: toolsCountSnap?.data()?.count || 0,
            users: usersCountSnap?.data()?.count || 0,
            products: productsCountSnap?.data()?.count || 0,
            systems: systemsCountSnap?.data()?.count || 0,
            submissions: submissionsCountSnap?.data()?.count || 0,
            clicks: clicksCountSnap?.data()?.count || 0,
            downloads: downloadsCountSnap?.data()?.count || 0,
        },
        sponsorshipStats,
        activeSponsoredTools,
        topTools:
            topToolsSnap?.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
            })) || [],
        recentSubmissions:
            recentSubmissionsSnap?.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
            })) || [],
    };
}

function formatDate(v?: number | string) {
    if (!v) return "-";
    const d = typeof v === "number" ? new Date(v) : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

export default async function AdminDashboard() {
    const { stats, topTools, recentSubmissions, sponsorshipStats, activeSponsoredTools } =
        await getDashboardData();

    return (
        <main className="max-w-7xl mx-auto px-6 py-16">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Admin dashboard v2
                </div>

                <h1 className="mt-5 text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Monitor your AI tools directory, JLADAN platform, and sponsored listings from one place.
                </p>
            </div>

            {/* Main stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
                <StatCard label="Tools" value={stats.tools} />
                <StatCard label="Users" value={stats.users} />
                <StatCard label="Products" value={stats.products} />
                <StatCard label="Systems" value={stats.systems} />
                <StatCard label="Submissions" value={stats.submissions} />
                <StatCard label="Clicks" value={stats.clicks} />
                <StatCard label="Downloads" value={stats.downloads} />
            </section>

            {/* Sponsorship stats */}
            <section className="mt-8">
                <div className="flex items-end justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-2xl font-extrabold">Sponsored Listings</h2>
                        <p className="text-sm text-muted-foreground">
                            Track sponsorship requests, approvals, and active sponsored tools.
                        </p>
                    </div>

                    <Link
                        href="/admin/sponsorships"
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                    >
                        Manage sponsorships
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <StatCard label="Requests" value={sponsorshipStats.total} />
                    <StatCard label="Pending Payment" value={sponsorshipStats.pendingPayment} />
                    <StatCard label="Paid" value={sponsorshipStats.paid} />
                    <StatCard label="Approved" value={sponsorshipStats.approved} />
                    <StatCard label="Rejected" value={sponsorshipStats.rejected} />
                    <StatCard label="Active Sponsored Tools" value={activeSponsoredTools} />
                </div>
            </section>

            {/* Quick links */}
            <section className="mt-8 grid gap-6 lg:grid-cols-4">
                <AdminCard
                    title="Tools Directory"
                    desc="Manage directory tools, featured status, sponsorship, and publishing."
                    links={[
                        { href: "/admin/tools", label: "Manage Tools" },
                        { href: "/admin/tools/new", label: "New Tool" },
                    ]}
                />

                <AdminCard
                    title="JLADAN Products"
                    desc="Manage premium downloadable products."
                    links={[
                        { href: "/admin/products", label: "Manage Products" },
                        { href: "/admin/products/new", label: "New Product" },
                    ]}
                />

                <AdminCard
                    title="Submissions Moderation"
                    desc="Review and approve or reject submitted tools."
                    links={[{ href: "/admin/submissions", label: "Review Submissions" }]}
                />

                <AdminCard
                    title="Sponsorship Sales"
                    desc="Review paid sponsorship requests and activate promoted listings."
                    links={[
                        { href: "/admin/sponsorships", label: "Sponsorship Requests" },
                        { href: "/promote", label: "Open Promote Page" },
                    ]}
                />
            </section>

            {/* Analytics sections */}
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-extrabold">Top Clicked Tools</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Based on the current clicks field stored on tools.
                            </p>
                        </div>
                        <Link
                            href="/admin/tools"
                            className="text-sm underline text-muted-foreground hover:text-foreground"
                        >
                            Open tools
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {topTools.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tools data yet.</p>
                        ) : (
                            topTools.map((tool: any, idx: number) => (
                                <div
                                    key={tool.id}
                                    className="rounded-2xl border border-border/60 bg-background/30 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-semibold">
                                                #{idx + 1} {tool.name || tool.id}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {tool.category || "general"} • slug: {tool.slug || tool.id}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-extrabold">{tool.clicks || 0}</div>
                                            <div className="text-xs text-muted-foreground">clicks</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-extrabold">Recent Submissions</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest tool submissions from users.
                            </p>
                        </div>
                        <Link
                            href="/admin/submissions"
                            className="text-sm underline text-muted-foreground hover:text-foreground"
                        >
                            Review
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {recentSubmissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No submissions yet.</p>
                        ) : (
                            recentSubmissions.map((sub: any) => (
                                <div
                                    key={sub.id}
                                    className="rounded-2xl border border-border/60 bg-background/30 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-semibold">{sub.name || "(no name)"}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {sub.category || "general"} • {sub.email || "no email"}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">
                                                {sub.status || "pending"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(sub.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Public quick links */}
            <section className="mt-8 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                <h2 className="text-xl font-extrabold">Public Side Quick Access</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Jump quickly to the public pages to verify content and UX.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    <QuickLink href="/" label="Homepage" />
                    <QuickLink href="/tools" label="Tools" />
                    <QuickLink href="/categories" label="Categories" />
                    <QuickLink href="/best" label="Best" />
                    <QuickLink href="/submit" label="Submit Tool" />
                    <QuickLink href="/promote" label="Promote" />
                    <QuickLink href="/pricing" label="Pricing" />
                    <QuickLink href="/library" label="Library" />
                    <QuickLink href="/systems" label="Systems" />
                </div>
            </section>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-extrabold">{value}</div>
        </div>
    );
}

function AdminCard({
    title,
    desc,
    links,
}: {
    title: string;
    desc: string;
    links: { href: string; label: string }[];
}) {
    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
            <h2 className="text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

            <div className="mt-5 flex flex-wrap gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/30"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function QuickLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/30"
        >
            {label}
        </Link>
    );
}
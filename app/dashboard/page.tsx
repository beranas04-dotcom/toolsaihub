import Link from "next/link";
import { getSessionUid } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getSubscriptionStatus } from "@/lib/billing/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserDoc = {
    email?: string;
    displayName?: string;
    subscription?: {
        status?: string;
        plan?: string;
        provider?: string;
        updatedAt?: number;
    };
    stats?: {
        downloads?: number;
        lastDownloadedAt?: number;
    };
};

function formatDate(v?: number) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
}

export default async function DashboardPage() {
    const uid = await getSessionUid();

    if (!uid) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Sign in required
                </div>

                <h1 className="mt-6 text-4xl font-extrabold">Your Dashboard</h1>

                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                    Sign in to access your JLADAN dashboard, premium library, systems, and downloads.
                </p>

                <div className="mt-10">
                    <Link
                        href="/pricing"
                        className="inline-flex rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-white hover:opacity-95"
                    >
                        Sign in & continue
                    </Link>
                </div>
            </main>
        );
    }

    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(uid).get();
    const user = (userSnap.data() || {}) as UserDoc;

    if (!uid) {
        return { active: false, isAdmin: false };
    }

    const subscription = await getSubscriptionStatus(uid);

    const downloads = Number(user?.stats?.downloads || 0);
    const lastDownloadedAt = user?.stats?.lastDownloadedAt;
    const plan = subscription.active ? "JLADAN Pro" : "Free";
    const email = user?.email || "-";

    return (
        <main className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            {/* Header */}
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    JLADAN Dashboard
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    Welcome back
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    Manage your access, continue inside the library, and keep track of your premium usage.
                </p>
            </section>

            {/* Main stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Plan"
                    value={plan}
                    sub={subscription.active ? "Subscription active" : "No active subscription"}
                />

                <StatCard
                    label="Downloads"
                    value={String(downloads)}
                    sub="Tracked downloads"
                />

                <StatCard
                    label="Last download"
                    value={formatDate(lastDownloadedAt)}
                    sub="Most recent activity"
                />

                <StatCard
                    label="Account"
                    value={email}
                    sub="Signed-in email"
                />
            </section>

            {/* Conversion / onboarding */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                    <h2 className="text-2xl font-extrabold">
                        {subscription.active ? "Continue inside JLADAN Pro" : "Unlock JLADAN Pro"}
                    </h2>

                    <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                        {subscription.active
                            ? "Jump back into your premium library, explore systems, and download the resources that help you move faster."
                            : "Upgrade to access premium systems, downloadable assets, and the full JLADAN resource library."}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <ValueCard
                            title="Premium systems"
                            desc="Step-by-step playbooks to build with AI and monetize faster."
                        />
                        <ValueCard
                            title="Downloadable assets"
                            desc="Templates, kits, prompts, and practical files ready to use."
                        />
                        <ValueCard
                            title="Library access"
                            desc="A central premium area for your systems and products."
                        />
                        <ValueCard
                            title="Ongoing drops"
                            desc="New premium resources can be added over time."
                        />
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        {subscription.active ? (
                            <>
                                <Link
                                    href="/library"
                                    className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Open Library
                                </Link>

                                <Link
                                    href="/systems"
                                    className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                                >
                                    Explore Systems
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/pricing"
                                    className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                                >
                                    Unlock JLADAN Pro
                                </Link>

                                <Link
                                    href="/systems"
                                    className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                                >
                                    Preview Systems
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Side actions */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                        <h2 className="text-xl font-extrabold">Quick actions</h2>

                        <div className="mt-5 flex flex-col gap-3">
                            <QuickLink href="/library" label="Open Library" />
                            <QuickLink href="/systems" label="Explore Systems" />
                            <QuickLink href="/pricing" label="View Pricing" />
                            <QuickLink href="/tools" label="Browse Tools" />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6">
                        <h2 className="text-xl font-extrabold">Recommended next step</h2>

                        <p className="mt-3 text-sm text-muted-foreground">
                            {subscription.active
                                ? "The fastest way to get value is to open a system, then download the assets inside it."
                                : "Preview a system or product first, then unlock JLADAN Pro when you’re ready."}
                        </p>

                        <div className="mt-5">
                            <Link
                                href="/systems"
                                className="inline-flex rounded-2xl border border-border bg-background px-5 py-2.5 font-semibold hover:bg-muted/30"
                            >
                                Go to Systems
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage / plan state */}
            <section className="mt-8 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                <h2 className="text-2xl font-extrabold">Account overview</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <MiniInfo
                        label="Subscription"
                        value={subscription.active ? "Active" : "Inactive"}
                    />
                    <MiniInfo
                        label="Current plan"
                        value={subscription.active ? "JLADAN Pro" : "Free"}
                    />
                    <MiniInfo
                        label="Downloads tracked"
                        value={String(downloads)}
                    />
                </div>
            </section>
        </main>
    );
}

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-extrabold break-words">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
        </div>
    );
}

function ValueCard({
    title,
    desc,
}: {
    title: string;
    desc: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="font-semibold">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}

function QuickLink({
    href,
    label,
}: {
    href: string;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted/30"
        >
            {label}
        </Link>
    );
}

function MiniInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-lg font-bold">{value}</div>
        </div>
    );
}
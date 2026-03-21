import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SystemDoc = {
    title?: string;
    subtitle?: string;
    summary?: string;
    published?: boolean;
    updatedAt?: number;
    createdAt?: number;
    category?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    timeToLaunch?: string;
    revenuePotential?: string;
    assets?: Array<{ productId: string }>;
};

function toTitleFromId(id: string) {
    return id
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toLabel(s?: string) {
    if (!s) return "General";
    const x = s.replace(/[-_]/g, " ").trim();
    return x.charAt(0).toUpperCase() + x.slice(1);
}

export default async function SystemsPage() {
    const db = getAdminDb();
    const snap = await db.collection("systems").get();

    const systems = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as SystemDoc) }))
        .filter((s) => s.published !== false)
        .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Hero */}
            <section className="mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Systems • Step-by-step playbooks
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    🧠 JLADAN Systems
                </h1>

                <p className="mt-3 text-muted-foreground max-w-2xl">
                    Ready-made execution systems that help you move faster with AI, monetization, content, and digital products.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        Premium playbooks
                    </span>
                    <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        Assets included
                    </span>
                    <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        JLADAN Pro
                    </span>
                </div>
            </section>

            {/* Conversion strip */}
            <section className="mb-12 rounded-3xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Included in JLADAN Pro
                        </div>

                        <h2 className="mt-4 text-2xl font-extrabold">
                            Unlock systems + downloadable assets
                        </h2>

                        <p className="mt-2 text-sm md:text-base text-muted-foreground">
                            Each system is built to guide execution and includes resources you can use directly inside JLADAN.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/pricing"
                            className="rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white hover:opacity-95"
                        >
                            Unlock JLADAN Pro
                        </Link>

                        <Link
                            href="/library"
                            className="rounded-2xl border border-border bg-background px-6 py-3 text-center font-semibold hover:bg-muted/30"
                        >
                            View Library
                        </Link>
                    </div>
                </div>
            </section>

            {/* List */}
            {systems.length === 0 ? (
                <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur p-10 text-center jl-glow">
                    <h2 className="text-xl font-bold">No systems yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add your first system in Firestore collection: <b>systems</b>
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systems.map((s) => {
                        const title = s.title || toTitleFromId(s.id);
                        const assetsCount = Array.isArray(s.assets) ? s.assets.length : 0;

                        return (
                            <div
                                key={s.id}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-card jl-glow hover:opacity-[0.98] transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="font-extrabold text-lg">{title}</h2>
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                            {s.summary || s.subtitle || "Open this system to see the assets & steps."}
                                        </p>
                                    </div>

                                    <span className="text-[11px] rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary shrink-0">
                                        PRO
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {s.category ? (
                                        <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                            {toLabel(s.category)}
                                        </span>
                                    ) : null}

                                    {s.difficulty ? (
                                        <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                            {toLabel(s.difficulty)}
                                        </span>
                                    ) : null}

                                    {s.timeToLaunch ? (
                                        <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                            ⏱ {s.timeToLaunch}
                                        </span>
                                    ) : null}

                                    {s.revenuePotential ? (
                                        <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                            💰 {s.revenuePotential}
                                        </span>
                                    ) : null}

                                    <span className="text-[11px] rounded-full border border-border bg-muted/30 px-2.5 py-1 text-muted-foreground">
                                        {assetsCount} asset(s)
                                    </span>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Link
                                        href={`/systems/${s.id}`}
                                        className="flex-1 rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white hover:opacity-95"
                                    >
                                        Open system
                                    </Link>
                                </div>

                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    Includes roadmap + assets + execution steps
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
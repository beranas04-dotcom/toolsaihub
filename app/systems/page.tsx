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
};

function toTitleFromId(id: string) {
    return id
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function SystemsPage() {
    const db = getAdminDb();
    const snap = await db.collection("systems").get();

    const systems = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as SystemDoc) }))
        .filter((s) => s.published !== false)
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 jl-3d relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Header */}
            <section className="mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Systems • Step-by-step playbooks
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    🧠 JLADAN Systems
                </h1>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Systems كتعاونك تبني business منظم: products, content, lead gen…
                </p>
            </section>

            {systems.length === 0 ? (
                <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur p-10 text-center jl-glow">
                    <h2 className="text-xl font-bold">No systems yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        زيد أول system فـ Firestore فـ collection: <b>systems</b>
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systems.map((s) => {
                        const title = s.title || toTitleFromId(s.id);
                        return (
                            <Link
                                key={s.id}
                                href={`/systems/${s.id}`}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-card jl-glow hover:opacity-[0.98] transition"
                            >
                                <h2 className="font-extrabold text-lg">{title}</h2>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                    {s.summary || s.subtitle || "Open this system to see the assets & steps."}
                                </p>

                                <div className="mt-5 inline-flex items-center text-sm underline text-muted-foreground hover:text-foreground">
                                    Open system →
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
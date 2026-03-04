import Link from "next/link";
import { getAdminDb } from "@/lib/firebaseAdmin";
import DownloadButton from "@/components/DownloadButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SystemAsset = {
    title: string;
    description?: string;
    productId: string; // must match products doc id
};

type SystemDoc = {
    title?: string;
    subtitle?: string;
    summary?: string;
    assets?: SystemAsset[];
};

function toTitleFromId(id: string) {
    return id
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function SystemPage({
    params,
}: {
    params: { slug: string };
}) {
    const db = getAdminDb();

    const docRef = db.collection("systems").doc(params.slug);
    const snap = await docRef.get();

    if (!snap.exists) {
        return (
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl font-extrabold mb-3">System not found</h1>
                <Link href="/systems" className="underline">
                    Back to systems
                </Link>
            </main>
        );
    }

    const data = snap.data() as SystemDoc;
    const title = data.title || toTitleFromId(params.slug);
    const assets = Array.isArray(data.assets) ? data.assets : [];

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
                <Link
                    href="/systems"
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    ← Back to systems
                </Link>

                <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">
                    {title}
                </h1>

                {data.subtitle ? (
                    <p className="mt-2 text-muted-foreground max-w-2xl">{data.subtitle}</p>
                ) : null}

                {data.summary ? (
                    <div className="mt-6 rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-glow">
                        <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
                    </div>
                ) : null}
            </section>

            {/* Assets */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">Assets</h2>
                    <span className="text-sm text-muted-foreground">
                        {assets.length} item(s)
                    </span>
                </div>

                {assets.length === 0 ? (
                    <div className="rounded-3xl border border-border/60 bg-background/40 backdrop-blur p-10 text-center jl-glow">
                        <h3 className="text-lg font-bold">No assets yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            زيد `assets` array فـ Firestore فـ هاد system.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map((a, idx) => (
                            <div
                                key={`${a.productId}-${idx}`}
                                className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-6 jl-card jl-glow"
                            >
                                <h3 className="font-extrabold text-lg truncate">{a.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                                    {a.description || "System resource"}
                                </p>

                                <div className="mt-6">
                                    <DownloadButton
                                        productId={a.productId}
                                        className="w-full rounded-2xl bg-primary px-4 py-2.5 text-center font-semibold text-white hover:opacity-95"
                                        label="Download"
                                    />
                                </div>

                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    Downloads are tracked + limited per day
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
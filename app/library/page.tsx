import Link from "next/link";
import LibraryUI from "@/components/LibraryUI";
import { getSessionUid } from "@/lib/auth/session";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { filterLibraryContent, getLibraryContent } from "@/lib/jladan/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function LibraryPaywall({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <main className="max-w-4xl mx-auto px-6 py-24 text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                JLADAN Pro Library
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-extrabold">
                {title}
            </h1>

            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                {description}
            </p>

            {/* VALUE PREVIEW */}
            <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">

                <div className="rounded-2xl border border-border p-5">
                    <div className="font-semibold">📦 Premium AI Systems</div>
                    <p className="text-sm text-muted-foreground">
                        Step-by-step systems showing how to actually monetize AI.
                    </p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                    <div className="font-semibold">⚡ Ready-to-Use Templates</div>
                    <p className="text-sm text-muted-foreground">
                        Prompts, automation kits, Notion workspaces and workflows.
                    </p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                    <div className="font-semibold">🚀 Weekly Drops</div>
                    <p className="text-sm text-muted-foreground">
                        New systems, tools and templates added regularly.
                    </p>
                </div>

                <div className="rounded-2xl border border-border p-5">
                    <div className="font-semibold">💰 Monetization Playbooks</div>
                    <p className="text-sm text-muted-foreground">
                        Real strategies to build income using AI tools.
                    </p>
                </div>

            </div>

            <div className="mt-12">
                <Link
                    href="/pricing"
                    className="inline-flex rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-white hover:opacity-95"
                >
                    Unlock JLADAN Pro — $5/month
                </Link>
            </div>

        </main>
    );
}

export default async function LibraryPage({
    searchParams,
}: {
    searchParams?: { q?: string; cat?: string; tab?: string };
}) {
    const uid = await getSessionUid();

    // ❌ Not logged in
    if (!uid) {
        return (
            <LibraryPaywall
                title="Sign in to access the JLADAN Library"
                description="Create an account and unlock premium AI systems, templates and growth resources."
            />
        );
    }

    if (!uid) {
        return { active: false, isAdmin: false };
    }

    const subscription = await getSubscriptionStatus(uid);

    const hasAccess =
        subscription?.active === true || subscription?.isAdmin === true;

    if (!hasAccess) {
        return (
            <LibraryPaywall
                title="Unlock the JLADAN AI Library"
                description="Access premium AI systems, templates, prompts and monetization resources with JLADAN Pro."
            />
        );
    }

    // ✅ User has active subscription
    const { systems, products } = await getLibraryContent();

    const filtered = filterLibraryContent({
        systems,
        products,
        qRaw: searchParams?.q,
        catRaw: searchParams?.cat,
    });

    return (
        <LibraryUI
            systems={filtered.systems}
            products={filtered.products}
            categories={filtered.categories}
            q={filtered.q}
            rawQ={filtered.rawQ}
            cat={filtered.cat}
        />
    );
}
import type { Metadata } from "next";
import SubmitToolFormClient from "@/components/submit/SubmitToolFormClient";
import { siteMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
    title: `Submit a Tool — ${siteMetadata.siteName}`,
    description: "Submit your AI tool to be reviewed and listed on our directory.",
};

export const dynamic = "force-dynamic";

export default function SubmitPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold font-display">Submit a Tool</h1>
                <p className="mt-3 text-muted-foreground">
                    Share your AI tool with thousands of visitors. We review submissions before publishing.
                </p>
            </header>

            <SubmitToolFormClient />
        </main>
    );
}

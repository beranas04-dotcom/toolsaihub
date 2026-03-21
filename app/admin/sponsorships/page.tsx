import SponsorshipsAdmin from "./sponsorships-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <main className="max-w-6xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-8">
                Sponsorship Requests
            </h1>

            <SponsorshipsAdmin />
        </main>
    );
}
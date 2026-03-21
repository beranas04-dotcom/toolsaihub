import ReviewsAdmin from "./reviews-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
    return (
        <main className="max-w-7xl mx-auto px-6 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold">Review Moderation</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Review, publish, feature, and remove user reviews from the directory.
                </p>
            </div>

            <ReviewsAdmin />
        </main>
    );
}
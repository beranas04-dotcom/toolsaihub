import Link from "next/link";

export default function NotFound() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-16">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <p className="text-sm text-white/60">Error 404</p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                    Page not found
                </h1>

                <p className="mt-3 text-white/70">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90"
                    >
                        Go Home
                    </Link>

                    <Link
                        href="/tools"
                        className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm font-medium hover:bg-white/5"
                    >
                        Browse Tools
                    </Link>

                    <Link
                        href="/search"
                        className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm font-medium hover:bg-white/5"
                    >
                        Search
                    </Link>
                </div>
            </div>
        </div>
    );
}

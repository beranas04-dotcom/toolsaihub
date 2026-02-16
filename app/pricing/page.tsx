export default function PricingPage() {
    return (
        <main className="max-w-5xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Promote your AI Tool 🚀
            </h1>

            <div className="grid md:grid-cols-3 gap-6 mt-10">

                {/* Free */}
                <div className="border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold">Free</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Basic listing after review
                    </p>
                    <p className="mt-4 text-2xl font-bold">$0</p>
                </div>

                {/* Featured */}
                <div className="border border-primary rounded-xl p-6">
                    <h2 className="text-xl font-bold">Featured</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Appear in homepage
                    </p>
                    <p className="mt-4 text-2xl font-bold">$29</p>
                </div>

                {/* Premium */}
                <div className="border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold">Premium</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Top placement + badge
                    </p>
                    <p className="mt-4 text-2xl font-bold">$79</p>
                </div>

            </div>
        </main>
    );
}

import SearchClient from "./search-client";

export const metadata = {
    title: "Search | AIToolsHub",
    description: "Search tools using the local search index.",
};

export default function SearchPage() {
    return (
        <div className="container mx-auto px-6 py-10">
            <div className="max-w-3xl">
                <h1 className="text-4xl font-bold mb-2">Search</h1>
                <p className="text-muted-foreground mb-6">
                    Search tools from <code className="px-1 py-0.5 rounded bg-muted">/public/search-index.json</code>.
                </p>
            </div>

            <SearchClient />
        </div>
    );
}

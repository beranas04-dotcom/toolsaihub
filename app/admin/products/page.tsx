import ProductsAdmin from "./products-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
    return (
        <main className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold">Products</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Manage products (publish, edit, tier, Drive fileId…).
                    </p>
                </div>

                <a
                    href="/admin/products/new"
                    className="rounded-2xl bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-95"
                >
                    + New product
                </a>
            </div>

            <ProductsAdmin />
        </main>
    );
}
import ProductForm from "./product-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function NewProductPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold">Create Product</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Add a new downloadable product (Drive fileId required).
                </p>
            </div>

            <ProductForm />
        </main>
    );
}
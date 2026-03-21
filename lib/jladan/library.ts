import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { Product, SystemItem } from "@/types/library";

export async function getLibraryContent() {
    const db = getAdminDb();

    const [systemsSnap, productsSnap] = await Promise.all([
        db.collection("systems").orderBy("createdAt", "desc").get(),
        db.collection("products")
            .where("published", "==", true)
            .orderBy("createdAt", "desc")
            .get(),
    ]);

    const systems: SystemItem[] = systemsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));

    const products: Product[] = productsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));

    return { systems, products };
}

export function filterLibraryContent({
    systems,
    products,
    qRaw,
    catRaw,
}: {
    systems: SystemItem[];
    products: Product[];
    qRaw?: string;
    catRaw?: string;
}) {
    let filteredSystems = [...systems];
    let filteredProducts = [...products];

    const q = String(qRaw || "").trim().toLowerCase();
    const cat = String(catRaw || "all").trim().toLowerCase();

    const categories = Array.from(
        new Set(
            [...systems, ...products].map((x: any) =>
                String(x?.category || "general").toLowerCase()
            )
        )
    ).sort();

    if (cat !== "all") {
        filteredSystems = filteredSystems.filter(
            (s) => String(s.category || "general").toLowerCase() === cat
        );

        filteredProducts = filteredProducts.filter(
            (p) => String(p.category || "general").toLowerCase() === cat
        );
    }

    if (q) {
        filteredSystems = filteredSystems.filter((s) => {
            const hay =
                `${s.title || ""} ${s.description || ""} ${s.category || ""}`.toLowerCase();
            return hay.includes(q);
        });

        filteredProducts = filteredProducts.filter((p) => {
            const hay =
                `${p.title || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
            return hay.includes(q);
        });
    }

    return {
        systems: filteredSystems,
        products: filteredProducts,
        categories,
        q,
        rawQ: String(qRaw || "").trim(),
        cat,
    };
}
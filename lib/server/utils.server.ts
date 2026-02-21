import "server-only";
import { getDb } from "@/lib/firebaseAdmin";

export async function getCategoriesFromDb() {
    const db = getDb();
    const snap = await db.collection("categories").limit(50).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

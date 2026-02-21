import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebaseAdmin";
import EditToolClient from "./EditToolClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toPlainJSON(value: any): any {
    if (value === null || value === undefined) return null;

    // Firestore Timestamp (admin) غالباً فيه toDate()
    if (typeof value === "object" && typeof value.toDate === "function") {
        try {
            return value.toDate().toISOString();
        } catch {
            return null;
        }
    }

    if (Array.isArray(value)) return value.map(toPlainJSON);

    if (typeof value === "object") {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) {
            const vv = toPlainJSON(v);
            // نحيدو undefined باش يبقى object serializable
            if (vv !== undefined) out[k] = vv;
        }
        return out;
    }

    // string/number/boolean
    return value;
}

export default async function AdminEditToolPage({ params }: { params: { id: string } }) {
    const user = await getServerSessionUser();
    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    const db = getAdminDb();
    const doc = await db.collection("tools").doc(params.id).get();

    if (!doc.exists) {
        redirect("/admin/tools");
    }

    const rawTool = { id: doc.id, ...(doc.data() as any) };

    // ✅ مهم: كنحوّل كلشي ل plain JSON قبل ما نمروه للـ client component
    const tool = toPlainJSON(rawTool);

    return <EditToolClient tool={tool} />;
}

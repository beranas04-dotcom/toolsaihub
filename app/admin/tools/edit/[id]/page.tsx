import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebaseAdmin";
import EditToolClient from "./EditToolClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminEditToolPage({ params }: { params: { id: string } }) {
    const user = await getServerSessionUser();
    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    const db = getAdminDb();
    const doc = await db.collection("tools").doc(params.id).get();

    if (!doc.exists) {
        redirect("/admin/tools");
    }

    const tool = { id: doc.id, ...(doc.data() as any) };

    return <EditToolClient tool={tool} />;
}

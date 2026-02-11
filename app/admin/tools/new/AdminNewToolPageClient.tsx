import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-session";
import AdminNewToolPageClient from "./AdminNewToolPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminNewToolPage() {
    try {
        await requireAdminUser();
        return <AdminNewToolPageClient />;
    } catch {
        redirect("/admin/login");
    }
}

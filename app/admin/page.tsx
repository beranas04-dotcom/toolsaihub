import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
    const user = await getServerSessionUser();

    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    redirect("/admin/tools");
}

import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/admin-session";
import { listSubmissions } from "@/lib/admin-submissions";
import SubmissionsClient from "./SubmissionsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSubmissionsPage() {
    const user = await getServerSessionUser();
    if (!user) redirect("/admin/login");
    if (!user.isAdmin) redirect("/");

    const submissions = await listSubmissions();

    return <SubmissionsClient initialSubmissions={submissions} />;
}

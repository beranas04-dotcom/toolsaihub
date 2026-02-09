import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Your AIToolsHub dashboard.",
};

export default function DashboardPage() {
    return <DashboardClient />;
}

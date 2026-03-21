import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function BestPaginationRedirect({
    params,
}: {
    params: { page: string };
}) {
    const page = String(params.page || "1");
    redirect(`/best?page=${encodeURIComponent(page)}`);
}
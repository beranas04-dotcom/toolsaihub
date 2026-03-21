import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function BestToolRedirectPage({
    params,
}: {
    params: { slug: string };
}) {
    redirect(`/tools/${encodeURIComponent(params.slug)}`);
}
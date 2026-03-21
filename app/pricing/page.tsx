import { Suspense } from "react";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <PricingClient />
        </Suspense>
    );
}
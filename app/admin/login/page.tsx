import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <LoginClient />
        </Suspense>
    );
}
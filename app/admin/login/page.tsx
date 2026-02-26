import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLoginPage() {
    return (
        <Suspense
            fallback={
                <main className="container mx-auto px-6 py-16 max-w-md">
                    <p className="text-muted-foreground">Loading...</p>
                </main>
            }
        >
            <LoginClient />
        </Suspense>
    );
}
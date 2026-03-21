"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useState } from "react";

export const dynamic = "force-dynamic";
export default function AdminLoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const next = searchParams.get("next") || "/admin";

    async function handleLogin() {
        try {
            setErr(null);
            setLoading(true);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);

            // 1) create main user session
            const sRes = await fetch("/api/user/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
                credentials: "include",
            });

            const sJson = await sRes.json().catch(() => null);
            if (!sRes.ok) {
                throw new Error(sJson?.error || "Failed to create user session");
            }

            // 2) create admin cookie for middleware
            const aRes = await fetch("/api/admin/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                credentials: "include",
            });

            const aJson = await aRes.json().catch(() => null);
            if (!aRes.ok) {
                throw new Error(aJson?.error || "Admin access denied");
            }

            router.replace(next);
            router.refresh();
        } catch (e: any) {
            console.error(e);
            setErr(e?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-xl mx-auto px-6 py-20">
            <div className="rounded-3xl border border-border/60 bg-background/35 backdrop-blur p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Admin access
                </div>

                <h1 className="mt-5 text-3xl font-extrabold">Admin Login</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sign in with your admin Google account to access the dashboard.
                </p>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-6 w-full rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                {err ? (
                    <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {err}
                    </div>
                ) : null}
            </div>
        </main>
    );
}
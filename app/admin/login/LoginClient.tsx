"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function LoginClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const nextUrl = useMemo(() => searchParams.get("next") || "/admin", [searchParams]);
    const error = searchParams.get("error");

    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const who = await fetch("/api/auth/whoami", { credentials: "include" })
                    .then((r) => r.json())
                    .catch(() => null);

                if (!alive) return;

                if (who?.user?.admin) {
                    router.replace("/admin");
                    return;
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [router]);

    async function signIn() {
        try {
            setSigning(true);

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(true);

            const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("SESSION ERROR:", data);
                alert("Session failed: " + (data?.error || "unknown"));
                return;
            }

            router.replace(nextUrl);
        } catch (e) {
            console.error(e);
            alert("Login failed");
        } finally {
            setSigning(false);
        }
    }

    if (loading) {
        return (
            <main className="container mx-auto px-6 py-16 max-w-md">
                <p className="text-muted-foreground">Checking session...</p>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-6 py-16 max-w-md">
            <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

            {error && (
                <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}

            <button
                onClick={signIn}
                disabled={signing}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-60"
            >
                {signing ? "Loading..." : "Continue with Google"}
            </button>
        </main>
    );
}
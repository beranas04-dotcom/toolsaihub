"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AdminLoginPage() {
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") || "/admin"; // ✅ فين يمشي من بعد login
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const who = await fetch("/api/auth/whoami", { credentials: "include" })
                .then((r) => r.json())
                .catch(() => null);

            if (who?.user?.admin) {
                window.location.href = "/admin";
                return;
            }

            setLoading(false);
        })();
    }, []);

    async function signIn() {
        try {
            setLoading(true);
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

            window.location.href = nextUrl;
        } catch (e) {
            console.error(e);
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="container mx-auto px-6 py-16 max-w-md">
            <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

            <button
                onClick={signIn}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-60"
            >
                {loading ? "Loading..." : "Continue with Google"}
            </button>
        </main>
    );
}
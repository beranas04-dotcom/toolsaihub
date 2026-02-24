"use client";

import {
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // ✅ after redirect, complete login + create session cookie
    useEffect(() => {
        (async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!result?.user) return;

                setLoading(true);
                setStatus("Finishing sign-in...");

                const token = await result.user.getIdToken(true);

                const res = await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                    cache: "no-store",
                    credentials: "include",
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setStatus(`Session failed: ${err?.error || res.status}`);
                    setLoading(false);
                    return;
                }

                // ✅ go to dashboard (full reload so middleware sees cookie)
                window.location.href = "/admin";
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    async function signInWithGoogleRedirect() {
        if (loading) return;
        setLoading(true);
        setStatus("Redirecting to Google...");

        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    }

    return (
        <main className="container mx-auto px-6 py-16 max-w-md">
            <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

            <button
                onClick={signInWithGoogleRedirect}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Continue with Google"}
            </button>

            {status ? (
                <p className="mt-4 text-sm opacity-80 break-words">
                    <b>Status:</b> {status}
                </p>
            ) : null}
        </main>
    );
}
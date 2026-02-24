"use client";

import { useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);

    // ✅ after redirect, Firebase returns result هنا
    useEffect(() => {
        (async () => {
            try {
                const result = await getRedirectResult(auth);

                // user جا من redirect
                if (result?.user) {
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

                    // ✅ full reload to admin
                    window.location.href = "/admin";
                }
            } catch (e) {
                console.error("REDIRECT RESULT ERROR:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function signIn() {
        try {
            setLoading(true);
            const provider = new GoogleAuthProvider();
            await signInWithRedirect(auth, provider);
        } catch (e) {
            console.error("REDIRECT LOGIN ERROR:", e);
            alert("Login failed");
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
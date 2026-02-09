"use client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

export default function AuthClient() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/");
            }
        });
        return () => unsubscribe();
    }, [router]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password) {
            setError("Enter email & password");
            return;
        }

        if (mode === "register" && name.trim().length < 2) {
            setError("Enter the name (at least two letters)");
            return;
        }

        setLoading(true);
        try {
            if (mode === "register") {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (name.trim()) {
                    await updateProfile(cred.user, { displayName: name.trim() });
                }
                setSuccess("Account created successfully ✅ Now log in");
                setMode("login");
            } else {
                await signInWithEmailAndPassword(auth, email.trim(), password);
                setSuccess("✅ Hello! You're logged in");
                router.push("/");
                router.refresh();
            }

        } catch (err: any) {
            setError(err?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-md mx-auto px-6 py-20">
            <h1 className="text-3xl font-bold mb-4 text-center">
                {mode === "login" ? "Sign In" : "Sign Up"}
            </h1>

            <div className="flex justify-center gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`px-4 py-2 rounded-lg border ${mode === "login" ? "bg-primary text-primary-foreground" : ""
                        }`}
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onClick={() => setMode("register")}
                    className={`px-4 py-2 rounded-lg border ${mode === "register" ? "bg-primary text-primary-foreground" : ""
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
                {mode === "register" && (
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-border px-3 py-2 bg-background"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 bg-background"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 bg-background"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {error && <div className="text-sm text-red-500">{error}</div>}
                {success && <div className="text-sm text-green-500">{success}</div>}

                <button
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                    {loading ? "..." : mode === "login" ? "Sign In" : "Sign Up"}
                </button>
            </form>
        </main>
    );
}

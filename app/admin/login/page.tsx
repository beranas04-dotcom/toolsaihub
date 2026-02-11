"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();

            // save token in httpOnly cookie
            await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            router.replace("/admin");
            router.refresh();

        } catch (err) {
            console.error(err);
            alert("Google sign-in failed");
        }
    }

    return (
        <main className="container mx-auto px-6 py-16 max-w-md">
            <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

            <button
                onClick={signInWithGoogle}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold"
            >
                Continue with Google
            </button>
        </main>
    );
}

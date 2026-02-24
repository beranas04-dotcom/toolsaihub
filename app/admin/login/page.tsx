"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AdminLoginPage() {
    async function signInWithGoogle() {
        console.log("CLICKED LOGIN"); // ✅ debug

        try {
            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(auth, provider);
            console.log("GOOGLE OK", result.user.email);

            const token = await result.user.getIdToken(true);
            console.log("TOKEN OK");

            // 🚨 IMPORTANT
            console.log("CALLING SESSION API...");

            const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
                credentials: "include",
            });

            console.log("SESSION STATUS:", res.status);

            const data = await res.json();
            console.log("SESSION DATA:", data);

            if (!res.ok) {
                alert("Session failed: " + data.error);
                return;
            }

            console.log("REDIRECTING...");
            window.location.href = "/admin";

        } catch (err) {
            console.error("LOGIN ERROR:", err);
            alert("Login failed");
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
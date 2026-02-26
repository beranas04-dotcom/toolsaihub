"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useState } from "react";

export default function PricingPage() {
    const [loading, setLoading] = useState(false);

    async function subscribe() {
        try {
            setLoading(true);

            // 1) Google login
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);

            // 2) Create USER session cookie (for /pro later)
            const sRes = await fetch("/api/user/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
                credentials: "include",
            });

            if (!sRes.ok) {
                const err = await sRes.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to create user session");
            }

            // 3) Create checkout session (store uid/email)
            const res = await fetch("/api/lemon/start", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to start checkout");

            // 4) redirect to Lemon checkout
            window.location.href = data.url;
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-20">
            {/* 🔥 JLADAN PRO SUBSCRIPTION */}
            <div className="border border-primary rounded-2xl p-8 mb-16 text-center">
                <h2 className="text-3xl font-bold">JLADAN Pro 🔥</h2>
                <p className="text-muted-foreground mt-2">
                    Unlock premium AI tools, templates & exclusive content
                </p>

                <p className="mt-6 text-4xl font-bold">$5/mo</p>

                <ul className="mt-6 space-y-2 text-sm">
                    <li>✅ Full premium access</li>
                    <li>✅ Exclusive AI tools & prompts</li>
                    <li>✅ Updated weekly</li>
                    <li>✅ Cancel anytime</li>
                </ul>

                <button
                    onClick={subscribe}
                    disabled={loading}
                    className="mt-8 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? "Loading..." : "Subscribe Now"}
                </button>
            </div>

            {/* OLD SECTION */}
            <h1 className="text-4xl font-bold mb-6 text-center">
                Promote your AI Tool 🚀
            </h1>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold">Free</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Basic listing after review
                    </p>
                    <p className="mt-4 text-2xl font-bold">$0</p>
                </div>

                <div className="border border-primary rounded-xl p-6">
                    <h2 className="text-xl font-bold">Featured</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Appear in homepage
                    </p>
                    <p className="mt-4 text-2xl font-bold">$29</p>
                </div>

                <div className="border border-border rounded-xl p-6">
                    <h2 className="text-xl font-bold">Premium</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Top placement + badge
                    </p>
                    <p className="mt-4 text-2xl font-bold">$79</p>
                </div>
            </div>
        </main>
    );
}
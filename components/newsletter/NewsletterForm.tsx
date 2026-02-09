"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToNewsletter } from "@/lib/firestore";
import { trackEvent } from "@/lib/analytics";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
        "idle"
    );
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        try {
            await subscribeToNewsletter(email);

            // ✅ Track success
            trackEvent("newsletter_subscribe", {
                source: "newsletter_form",
            });

            setStatus("success");
            setTimeout(() => {
                router.push("/thanks");
            }, 500);
        } catch (error: any) {
            if (error.message === "Email already subscribed") {
                // Consider it success (UX)
                trackEvent("newsletter_subscribe", {
                    source: "newsletter_form",
                    already_subscribed: true,
                });

                setStatus("success");
                setMessage("You're already subscribed!");
            } else {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <section className="bg-primary/5 border-y border-primary/10 py-16">
            <div className="container mx-auto px-4 text-center max-w-2xl">
                <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-2 block">
                    Weekly Digest
                </span>
                <h2 className="text-3xl font-bold mb-4 font-display">
                    Get the Best AI Tools Weekly
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    Join 10,000+ creators and developers. We scour the web for the most
                    useful AI tools so you don't have to.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 whitespace-nowrap"
                    >
                        {status === "loading" ? "Joining..." : "Subscribe Free"}
                    </button>
                </form>

                {message && (
                    <p
                        className={`text-sm mb-4 ${status === "error" ? "text-red-500" : "text-green-600"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <p className="text-xs text-muted-foreground/70">
                    No spam. Unsubscribe anytime.
                </p>
            </div>
        </section>
    );
}

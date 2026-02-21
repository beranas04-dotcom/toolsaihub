"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");

    // simple client-side rate limit (UX only; server has real limit)
    const cooldownMs = 10_000;
    const lastSentKey = "contact_last_sent_at";

    // ✅ keep lastSentAt in state (safe for SSR)
    const [lastSentAt, setLastSentAt] = useState<number>(0);

    // ✅ read localStorage only on client after mount
    useEffect(() => {
        try {
            const last = Number(window.localStorage.getItem(lastSentKey) || "0");
            setLastSentAt(Number.isFinite(last) ? last : 0);
        } catch {
            setLastSentAt(0);
        }
    }, []);

    const canSend = useMemo(() => {
        return Date.now() - lastSentAt > cooldownMs;
    }, [lastSentAt, cooldownMs]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (!canSend) {
            setStatus("error");
            setMessage("Please wait a few seconds before sending again.");
            return;
        }

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim(),
            // honeypot (bots will fill it)
            website: String(formData.get("website") || "").trim(),
        };

        // basic validation
        if (!payload.name || !payload.email || !payload.message) {
            setStatus("error");
            setMessage("Please fill in name, email, and message.");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "Failed to send message. Please try again.");
            }

            // ✅ write localStorage only on client, and update state
            const now = Date.now();
            try {
                window.localStorage.setItem(lastSentKey, String(now));
            } catch { }
            setLastSentAt(now);

            setStatus("success");
            setMessage("Thanks! Your message has been sent.");
            form.reset();
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message || "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Honeypot - hidden field */}
                <div className="hidden">
                    <label className="text-sm">Website</label>
                    <input name="website" autoComplete="off" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Your name"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={status === "loading"}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled={status === "loading"}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Subject (optional)</label>
                    <input
                        name="subject"
                        type="text"
                        placeholder="Partnership, feedback, bug..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        disabled={status === "loading"}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                        name="message"
                        placeholder="Write your message..."
                        className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={status === "loading"}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                    {status === "loading" ? "Sending..." : "Send message"}
                </button>

                {message && (
                    <p
                        className={`text-sm ${status === "success"
                                ? "text-green-600"
                                : status === "error"
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}

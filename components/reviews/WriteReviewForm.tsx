"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

function StarPicker({
    value,
    onChange,
    disabled,
}: {
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                const active = v <= value;
                return (
                    <button
                        key={v}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(v)}
                        className={`text-2xl leading-none transition ${active ? "text-yellow-400" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        aria-label={`${v} star`}
                    >
                        ★
                    </button>
                );
            })}
            <span className="ml-2 text-sm text-muted-foreground">{value ? `${value}/5` : ""}</span>
        </div>
    );
}

type ExistingReview = {
    id: string;
    toolId: string;
    rating: number;
    title: string;
    text: string;
    status: "pending" | "approved" | "rejected";
};

export default function WriteReviewForm({
    toolId,
    toolName,
}: {
    toolId: string;
    toolName: string;
}) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    const [loading, setLoading] = useState(false);
    const [prefillLoading, setPrefillLoading] = useState(false);

    const [okMsg, setOkMsg] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [existing, setExisting] = useState<ExistingReview | null>(null);
    const [userReady, setUserReady] = useState(false);

    // ✅ نسمعو لتغيير حالة تسجيل الدخول
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, () => setUserReady(true));
        return () => unsub();
    }, []);

    // ✅ نجيب review السابقة (إلا كاينة) باش نفعّل edit
    useEffect(() => {
        async function loadExisting() {
            setErrMsg(null);
            setOkMsg(null);

            const u = auth.currentUser;
            if (!u) {
                setExisting(null);
                return;
            }

            setPrefillLoading(true);
            try {
                const token = await u.getIdToken();
                const res = await fetch(`/api/reviews?toolId=${encodeURIComponent(toolId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Failed to load your review");

                const r = data?.review as ExistingReview | null;
                setExisting(r);

                if (r) {
                    setRating(Number(r.rating) || 0);
                    setTitle(r.title || "");
                    setText(r.text || "");
                }
            } catch (e: any) {
                setErrMsg(e?.message || "Failed to load your review");
            } finally {
                setPrefillLoading(false);
            }
        }

        if (userReady) loadExisting();
    }, [toolId, userReady]);

    const user = auth.currentUser;

    const disabled = useMemo(() => {
        return (
            loading ||
            prefillLoading ||
            !user ||
            rating < 1 ||
            rating > 5 ||
            text.trim().length < 20
        );
    }, [loading, prefillLoading, user, rating, text]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setOkMsg(null);
        setErrMsg(null);

        const u = auth.currentUser;
        if (!u) {
            setErrMsg("خاصك دير Sign in باش تكتب review.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setErrMsg("اختار rating من 1 حتى 5.");
            return;
        }

        if (text.trim().length < 20) {
            setErrMsg("الـ review قصيرة بزاف (على الأقل 20 حرف).");
            return;
        }

        setLoading(true);
        try {
            const token = await u.getIdToken(true);

            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toolId,
                    rating,
                    title: title.trim(),
                    text: text.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to submit review");

            // ✅ حدثنا existing باش يتحول الزر ل Update
            setExisting({
                id: data.reviewId,
                toolId,
                rating,
                title: title.trim(),
                text: text.trim(),
                status: "pending",
            });

            setOkMsg(
                data?.mode === "updated"
                    ? "✅ تبدلات review ديالك (Pending حتى يوافق الأدمن)."
                    : "✅ تسجلات review (Pending حتى يوافق الأدمن)."
            );
        } catch (e: any) {
            setErrMsg(e?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold">
                        {existing ? "Edit your review" : "Write a review"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {toolName ? `على ${toolName}. ` : ""}أي تعديل كيولي Pending حتى يراجعو الأدمن.
                    </p>
                </div>
                {!user ? <span className="text-xs text-muted-foreground">Sign in required</span> : null}
            </div>

            {prefillLoading ? (
                <div className="mt-4 text-sm text-muted-foreground">Loading your review...</div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div>
                    <div className="text-sm font-medium mb-2">Rating</div>
                    <StarPicker value={rating} onChange={setRating} disabled={loading || prefillLoading} />
                </div>

                <div>
                    <label className="text-sm font-medium">Title (optional)</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading || prefillLoading}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Short summary"
                        maxLength={80}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Your review</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading || prefillLoading}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
                        placeholder="What did you like/dislike? (min 20 chars)"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">{text.trim().length} chars</div>
                </div>

                {errMsg ? <div className="text-sm text-red-500">{errMsg}</div> : null}
                {okMsg ? <div className="text-sm text-green-500">{okMsg}</div> : null}

                <button
                    type="submit"
                    disabled={disabled}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                    {loading ? "Submitting..." : existing ? "Update review" : "Submit review"}
                </button>

                {existing ? (
                    <div className="text-xs text-muted-foreground">
                        Current status: <span className="font-semibold">{existing.status}</span>
                    </div>
                ) : null}
            </form>
        </section>
    );
}

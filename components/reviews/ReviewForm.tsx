"use client";

import { useMemo, useState } from "react";
import { auth } from "@/lib/firebaseClient";

type Props = {
    toolId: string;
    toolName?: string;
};

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
                        className={`text-2xl leading-none transition ${active ? "text-yellow-400" : "text-muted-foreground/30"
                            } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-110"}`}
                        aria-label={`Rate ${v} star`}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}

export default function ReviewForm({ toolId, toolName }: Props) {
    const [rating, setRating] = useState<number>(0);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return rating >= 1 && rating <= 5 && text.trim().length >= 20 && title.trim().length >= 3;
    }, [rating, text, title]);

    async function submit() {
        setErr(null);
        setMsg(null);

        const user = auth.currentUser;
        if (!user) {
            setErr("خاصك دير Sign in باش تكتب review.");
            return;
        }

        if (!canSubmit) {
            setErr("عمر rating + title + كتب على الأقل 20 حرف فـ review.");
            return;
        }

        setSubmitting(true);
        try {
            const token = await user.getIdToken();

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

            if (!res.ok) {
                setErr(data?.error || "وقع مشكل فـ إرسال review.");
                return;
            }

            setMsg("✅ Review تسجلت (Pending) — غادي تبان منين يوافق عليها الأدمن.");
            setRating(0);
            setTitle("");
            setText("");
        } catch (e: any) {
            setErr(e?.message || "Error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Write a review</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        شارك التجربة ديالك {toolName ? `مع ${toolName}` : ""}. (غادي تمشي Pending حتى يوافق الأدمن)
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-4">
                <div>
                    <div className="text-sm font-medium mb-2">Rating</div>
                    <StarPicker value={rating} onChange={setRating} disabled={submitting} />
                </div>

                <div className="grid gap-3">
                    <label className="text-sm">
                        <div className="font-medium mb-1">Title</div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                            placeholder="مثال: ممتاز للكتابة السريعة"
                        />
                    </label>

                    <label className="text-sm">
                        <div className="font-medium mb-1">Review</div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background min-h-[120px]"
                            placeholder="شنو عجبك؟ شنو ماعجبكش؟ كيفاش استعملتيه؟"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            على الأقل 20 حرف.
                        </div>
                    </label>
                </div>

                {err ? (
                    <div className="text-sm text-red-500">{err}</div>
                ) : null}
                {msg ? (
                    <div className="text-sm text-green-500">{msg}</div>
                ) : null}

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={submitting || !canSubmit}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                        ملاحظة: review كتمر من approval.
                    </span>
                </div>
            </div>
        </section>
    );
}

"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

export default function PricingPage() {
    const [loading, setLoading] = useState(false);

    async function subscribe() {
        try {
            setLoading(true);

            // 1) Google login
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);

            // 2) Create USER session cookie (for /pro)
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

            // 3) Create checkout session
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

    const faqs: FaqItem[] = useMemo(
        () => [
            {
                q: "شنو كنستافد من JLADAN Pro بالضبط؟",
                a: "كتاخد وصول كامل لـ Library (Prompts + Templates + Kits) + منتجات Pro كاملة + تحديثات وإضافات جديدة بشكل منتظم.",
            },
            {
                q: "واش نقدر نلغي فـ أي وقت؟",
                a: "نعم. تقدر تلغي فـ أي وقت من Portal ديال Lemon Squeezy، وكيتوقف التجديد تلقائياً فـ نهاية الدورة الحالية.",
            },
            {
                q: "فين غادي نلقى المنتجات من بعد ما نخلّص؟",
                a: "من بعد الدفع كترجع لصفحة /thanks ومن تما زر كيديك مباشرة لـ /library. وإذا كنت Pro، كلشي كيبان unlocked.",
            },
            {
                q: "واش كاين Refund؟",
                a: "إلا ماعجبكش المحتوى، تقدر تطلب refund فـ أول 7 أيام (إلا كان ممكن حسب الحالة). هدفنا تبقى راضي 100%.",
            },
            {
                q: "واش التحميل محمي 100%؟",
                a: "دابا فـ MVP التحميل كيحل روابط (باش نوصلو لأول sale بسرعة). من بعد كنزيدو حماية احترافية بتحميل عبر API + links مؤقتة.",
            },
            {
                q: "واش كاين Support ولا نقدر نطلب محتوى؟",
                a: "نعم. تقدر تقترح محتوى ولا تطلب template/kit، وغادي ناخدو الاقتراحات بعين الاعتبار فـ drops الجاية.",
            },
        ],
        []
    );

    return (
        <main className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            {/* HERO */}
            <section className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    New drops + premium library for creators & marketers
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                    JLADAN Pro: خدم أسرع، خرج نتائج أحسن، وبلا تضييع الوقت
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground">
                    Library ديال Prompts + Templates + Kits جاهزين للاستعمال.
                    مناسب للـ creators، marketers، و لأي واحد باغي يربح الوقت ويزيد الجودة.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {loading ? "Redirecting..." : "Get JLADAN Pro — $5/mo"}
                    </button>

                    <a
                        href="/library"
                        className="rounded-xl border border-border px-6 py-3 font-semibold hover:bg-muted text-center"
                    >
                        Preview Library
                    </a>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span>✅ Cancel anytime</span>
                    <span>✅ Instant access after checkout</span>
                    <span>✅ New drops regularly</span>
                    <span>✅ 7-day satisfaction promise</span>
                </div>
            </section>

            {/* PRICING GRID */}
            <section className="mt-14 grid gap-6 lg:grid-cols-3 items-stretch">
                {/* Left: features */}
                <div className="lg:col-span-2 rounded-2xl border border-border p-8">
                    <h2 className="text-2xl font-bold">What you get in Pro</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        كلشي مرتب ومقسم categories باش تلقى اللي محتاج بسرعة.
                    </p>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <Feature
                            title="Premium Library Access"
                            desc="وصول لـ prompts + templates + kits كاملة."
                        />
                        <Feature
                            title="Ready-to-use Products"
                            desc="ملفات جاهزين للتحميل والاستعمال مباشرة."
                        />
                        <Feature
                            title="New Drops"
                            desc="إضافات جديدة بشكل منتظم (weekly/monthly)."
                        />
                        <Feature
                            title="Updates & Improvements"
                            desc="تحسينات وتحديثات للمحتوى اللي كاين."
                        />
                        <Feature
                            title="Request Content"
                            desc="اقترح محتوى وغا نحاولو نخرّجوه فـ drops الجاية."
                        />
                        <Feature
                            title="Simple, Fast, No Fluff"
                            desc="محتوى عملي وcentered على النتائج."
                        />
                    </div>

                    <div className="mt-8 rounded-xl bg-muted/50 border border-border p-5">
                        <h3 className="font-semibold">Perfect for:</h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>• Marketers: Ads, emails, landing pages, offers</li>
                            <li>• Creators: content ideas, scripts, repurposing</li>
                            <li>• Freelancers: proposals, client workflows, delivery</li>
                            <li>• Founders: MVP copy, positioning, product pages</li>
                        </ul>
                    </div>
                </div>

                {/* Right: plan card */}
                <div className="rounded-2xl border border-primary/60 p-8 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">JLADAN Pro</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Full access + new drops
                            </p>
                        </div>
                        <span className="text-xs rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-1">
                            Most popular
                        </span>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-end gap-2">
                            <p className="text-5xl font-extrabold">$5</p>
                            <p className="text-sm text-muted-foreground mb-2">/ month</p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            أقل من ثمن قهوة/أسبوع… وكتربح ساعات ديال الخدمة.
                        </p>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm">
                        <li className="flex gap-2">
                            <span>✅</span> Unlock /pro + /library + Pro products
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span> Download premium files
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span> New drops regularly
                        </li>
                        <li className="flex gap-2">
                            <span>✅</span> Cancel anytime
                        </li>
                    </ul>

                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="mt-8 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {loading ? "Loading..." : "Subscribe & Unlock Now"}
                    </button>

                    <p className="mt-4 text-xs text-muted-foreground">
                        By subscribing you agree to our{" "}
                        <a className="underline hover:text-foreground" href="/terms">
                            Terms
                        </a>{" "}
                        and{" "}
                        <a className="underline hover:text-foreground" href="/privacy">
                            Privacy Policy
                        </a>
                        .
                    </p>

                    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Satisfaction promise</p>
                        <p className="mt-1">
                            7-day refund request possible (case-by-case). We want you happy.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="mt-16 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center">FAQ</h2>
                <p className="text-center mt-2 text-muted-foreground">
                    أسئلة كيتسولو بزاف قبل الاشتراك
                </p>

                <div className="mt-8 grid gap-4">
                    {faqs.map((item, idx) => (
                        <details
                            key={idx}
                            className="group rounded-xl border border-border p-5 open:bg-muted/30"
                        >
                            <summary className="cursor-pointer list-none font-semibold flex items-center justify-between">
                                <span>{item.q}</span>
                                <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform">
                                    +
                                </span>
                            </summary>
                            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <button
                        onClick={subscribe}
                        disabled={loading}
                        className="rounded-xl bg-primary px-8 py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {loading ? "Redirecting..." : "Join JLADAN Pro — $5/mo"}
                    </button>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Instant access بعد checkout. Cancel anytime.
                    </p>
                </div>
            </section>

            {/* Promote your tool (optional section kept) */}
            <section className="mt-20">
                <h2 className="text-3xl font-bold text-center">Promote your AI Tool 🚀</h2>
                <p className="text-center mt-2 text-muted-foreground">
                    Listing plans for tool owners (optional).
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-10">
                    <PlanCard
                        title="Free"
                        price="$0"
                        desc="Basic listing after review"
                        bullets={["Standard placement", "Reviewed submissions", "Public profile"]}
                    />
                    <PlanCard
                        title="Featured"
                        price="$29"
                        desc="Appear on homepage"
                        highlight
                        bullets={["Homepage exposure", "Priority placement", "Faster review"]}
                    />
                    <PlanCard
                        title="Premium"
                        price="$79"
                        desc="Top placement + badge"
                        bullets={["Top placement", "Premium badge", "Best visibility"]}
                    />
                </div>
            </section>
        </main>
    );
}

function Feature({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}

function PlanCard({
    title,
    price,
    desc,
    bullets,
    highlight,
}: {
    title: string;
    price: string;
    desc: string;
    bullets: string[];
    highlight?: boolean;
}) {
    return (
        <div
            className={[
                "rounded-2xl border p-6",
                highlight ? "border-primary/60" : "border-border",
            ].join(" ")}
        >
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{desc}</p>
            <p className="mt-4 text-3xl font-extrabold">{price}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {bullets.map((b, i) => (
                    <li key={i}>• {b}</li>
                ))}
            </ul>
            <button
                disabled
                className="mt-6 w-full rounded-xl border border-border px-4 py-3 font-semibold opacity-60 cursor-not-allowed"
                title="Connect later (MVP)"
            >
                Coming soon
            </button>
        </div>
    );
}
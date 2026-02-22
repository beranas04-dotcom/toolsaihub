"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FAQ = { q: string; a: string };

export default function EditBestPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [form, setForm] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        const res = await fetch(`/api/admin/best-pages/${id}`, { cache: "no-store" });
        const data = await res.json();
        setForm(data);
    }

    useEffect(() => { load(); }, [id]);

    function set(path: string, value: any) {
        setForm((prev: any) => {
            const copy = structuredClone(prev);
            const keys = path.split(".");
            let cur = copy;
            for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] ?? (cur[keys[i]] = {});
            cur[keys[keys.length - 1]] = value;
            return copy;
        });
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/best-pages/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to save");
            setForm(data);
            alert("Saved ✅");
        } finally {
            setSaving(false);
        }
    }

    if (!form) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Edit Best Page</h1>
                <div className="text-sm text-gray-600">/best/{form.slug}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <input className="border rounded-lg p-2" value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Title" />
                <input className="border rounded-lg p-2" value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Subtitle" />
            </div>

            <textarea className="border rounded-lg p-2 w-full min-h-[120px]"
                value={form.intro || ""} onChange={(e) => set("intro", e.target.value)} placeholder="Intro content..." />

            <div className="border rounded-xl p-4 space-y-3">
                <div className="font-semibold">SEO</div>
                <input className="border rounded-lg p-2 w-full"
                    value={form?.seo?.metaTitle || ""} onChange={(e) => set("seo.metaTitle", e.target.value)} placeholder="Meta title" />
                <input className="border rounded-lg p-2 w-full"
                    value={form?.seo?.metaDescription || ""} onChange={(e) => set("seo.metaDescription", e.target.value)} placeholder="Meta description" />
                <input className="border rounded-lg p-2 w-full"
                    value={form?.seo?.ogImage || ""} onChange={(e) => set("seo.ogImage", e.target.value)} placeholder="OG image URL" />
            </div>

            <div className="border rounded-xl p-4 space-y-3">
                <div className="font-semibold">Tool IDs (one per line)</div>
                <textarea
                    className="border rounded-lg p-2 w-full min-h-[140px]"
                    value={(form.toolIds || []).join("\n")}
                    onChange={(e) => set("toolIds", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                    placeholder="toolId1\ntoolId2\n..."
                />
                <div className="text-xs text-gray-600">
                    (مورا نزيدو dropdown باش تختار tools بسهولة، دابا نخليوها سريعة)
                </div>
            </div>

            <div className="border rounded-xl p-4 space-y-3">
                <div className="font-semibold flex items-center justify-between">
                    FAQ
                    <button className="border rounded-lg px-3 py-1"
                        onClick={() => set("faq", [...(form.faq || []), { q: "", a: "" }])}>
                        + Add
                    </button>
                </div>

                {(form.faq || []).map((f: FAQ, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <input className="border rounded-lg p-2 w-full"
                            value={f.q} onChange={(e) => {
                                const next = [...form.faq]; next[idx] = { ...next[idx], q: e.target.value }; set("faq", next);
                            }} placeholder="Question" />
                        <textarea className="border rounded-lg p-2 w-full min-h-[90px]"
                            value={f.a} onChange={(e) => {
                                const next = [...form.faq]; next[idx] = { ...next[idx], a: e.target.value }; set("faq", next);
                            }} placeholder="Answer" />
                        <button className="text-sm underline"
                            onClick={() => {
                                const next = [...form.faq];
                                next.splice(idx, 1);
                                set("faq", next);
                            }}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.published} onChange={(e) => set("published", e.target.checked)} />
                Published
            </label>

            <button
                className="bg-black text-white rounded-lg px-4 py-2 disabled:opacity-50"
                disabled={saving}
                onClick={save}
            >
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
}
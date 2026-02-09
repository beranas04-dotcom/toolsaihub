"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    signInWithRedirect,
    getRedirectResult,
} from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { isAdmin } from "@/lib/admin";
import type { Tool } from "@/types";
async function bootstrapAdminClaim(u: User) {
    // 1️⃣ خذ Firebase ID token
    const token = await u.getIdToken();

    // 2️⃣ خزّن token فـ cookie (session server)
    await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    });

    // 3️⃣ نادِ bootstrap ديال admin (custom claims)
    await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

const emptyTool: Tool = {
    id: "",
    name: "",
    tagline: "",
    description: "",
    category: "",
    tags: [],
    pricing: "",
    freeTrial: false,
    website: "",
    affiliateUrl: "",
    logo: "",
    features: [],
    pros: [],
    cons: [],
    featured: false,
    verified: false,
    status: "published",
    lastUpdated: new Date().toISOString().slice(0, 10),
    reviewedBy: "AIToolsHub Team",
};

function normalizeId(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function splitList(v: string) {
    return v
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
}

function joinList(v?: string[]) {
    return (v || []).join("\n");
}

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Tool>(emptyTool);

    const isAdminUser = useMemo(
        () => isAdmin(({ email: user?.email } as any)),
        [user?.email]
    );

    useEffect(() => {
        // ✅ complete redirect sign-in (mobile)
        getRedirectResult(auth).catch(() => { });
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);

            if (!u) {
                setTools([]);
                setLoading(false);
                return;
            }

            // 1) allow only emails in ADMIN_EMAILS
            if (!isAdmin(({ email: u.email } as any))) {
                setTools([]);
                setLoading(false);
                return;
            }

            // 2) bootstrap admin claim (sets admin=true)
            try {
                await bootstrapAdminClaim(u);
                // refresh token to include new claims
                await u.getIdToken(true);
            } catch (e) {
                // ignore (maybe already set)
                console.log("bootstrap skipped/failed:", e);
            }

            // 3) load tools
            await refreshTools();
            setLoading(false);
        });

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    async function refreshTools() {
        const q = query(collection(db, "tools"), orderBy("name"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => d.data() as Tool).filter((t) => t?.id);
        setTools(list);
    }

    async function login() {
        const provider = new GoogleAuthProvider();

        // ✅ mobile => redirect (reliable), desktop => popup
        const isMobile =
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 768px)").matches;

        if (isMobile) {
            await signInWithRedirect(auth, provider);
            return;
        }

        const res = await signInWithPopup(auth, provider);

        try {
            await bootstrapAdminClaim(res.user);
        } catch (e) {
            console.log("bootstrap failed", e);
        }
    }



    async function logout() {
        await signOut(auth);
        router.push("/");
        router.refresh();
    }


    function startCreate() {
        setEditingId(null);
        setForm({ ...emptyTool });
    }

    function startEdit(tool: Tool) {
        setEditingId(tool.id);
        setForm({ ...emptyTool, ...tool });
    }

    async function save() {
        const id = normalizeId((form as any).id || (form as any).slug || form.name);
        if (!id) {
            alert("Please set an ID (or name).");
            return;
        }
        if (!form.name?.trim()) {
            alert("Name is required.");
            return;
        }

        const payload: Tool = {
            ...form,
            id,
            slug: (form as any).slug || id,
            tags: (form.tags || []).filter(Boolean),
            features: (form.features || []).filter(Boolean),
            pros: (form.pros || []).filter(Boolean),
            cons: (form.cons || []).filter(Boolean),
            useCases: ((form as any).useCases || []).filter(Boolean),
            updatedAt: new Date().toISOString(),
            createdAt: (form as any).createdAt || new Date().toISOString(),
        };

        await setDoc(doc(db, "tools", id), payload, { merge: true });
        await refreshTools();
        setEditingId(id);
        alert("Saved ✅");
    }

    async function remove(id: string) {
        if (!confirm(`Delete tool "${id}"?`)) return;
        await deleteDoc(doc(db, "tools", id));
        await refreshTools();
        if (editingId === id) startCreate();
    }

    if (loading) {
        return <div className="container mx-auto px-6 py-12">Loading…</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-3">Admin</h1>
                <p className="text-muted-foreground mb-6">Sign in to manage tools.</p>
                <button
                    onClick={login}
                    className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }

    if (!isAdminUser) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-3">Access denied</h1>
                <p className="text-muted-foreground mb-6">
                    Your email <span className="font-medium">{user.email}</span> is not in
                    ADMIN_EMAILS.
                </p>
                <button
                    onClick={logout}
                    className="px-5 py-3 rounded-lg bg-muted font-semibold hover:bg-muted/80"
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Signed in as {user.email}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={startCreate}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    >
                        + New Tool
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-muted font-semibold hover:bg-muted/80"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: list */}
                <aside className="lg:col-span-1 border border-border rounded-2xl p-4 bg-card">
                    <div className="font-semibold mb-3">Tools ({tools.length})</div>
                    <div className="space-y-2 max-h-[70vh] overflow-auto pr-2">
                        {tools.map((t) => (
                            <div
                                key={t.id}
                                className={`p-3 rounded-xl border cursor-pointer transition ${editingId === t.id
                                    ? "border-primary"
                                    : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => startEdit(t)}
                            >
                                <div className="font-medium">{t.name}</div>
                                <div className="text-xs text-muted-foreground">{t.id}</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Right: form */}
                <section className="lg:col-span-2 border border-border rounded-2xl p-6 bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">
                            {editingId ? `Edit: ${editingId}` : "Create new tool"}
                        </div>
                        {editingId && (
                            <button
                                onClick={() => remove(editingId)}
                                className="px-3 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="text-sm">
                            <div className="font-medium mb-1">ID (slug)</div>
                            <input
                                value={(form as any).id || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...(p as any), id: e.target.value } as any))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="jasper-ai"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                                if empty, we generate from name.
                            </div>
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Name *</div>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Tagline</div>
                            <input
                                value={form.tagline || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, tagline: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Description</div>
                            <textarea
                                value={form.description || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, description: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[120px]"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Category</div>
                            <input
                                value={form.category || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, category: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="writing"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Pricing</div>
                            <input
                                value={form.pricing || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, pricing: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="Freemium, Pro $29/mo"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Website</div>
                            <input
                                value={form.website || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, website: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Affiliate URL</div>
                            <input
                                value={form.affiliateUrl || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, affiliateUrl: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Logo path</div>
                            <input
                                value={form.logo || ""}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, logo: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="/logos/tool.svg"
                            />
                        </label>

                        <label className="text-sm">
                            <div className="font-medium mb-1">Free trial</div>
                            <select
                                value={form.freeTrial ? "yes" : "no"}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, freeTrial: e.target.value === "yes" }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Tags (one per line)</div>
                            <textarea
                                value={joinList(form.tags)}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, tags: splitList(e.target.value) }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[90px]"
                            />
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Features (one per line)</div>
                            <textarea
                                value={joinList(form.features)}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        features: splitList(e.target.value),
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[90px]"
                            />
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Pros (one per line)</div>
                            <textarea
                                value={joinList(form.pros)}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, pros: splitList(e.target.value) }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[90px]"
                            />
                        </label>

                        <label className="text-sm md:col-span-2">
                            <div className="font-medium mb-1">Cons (one per line)</div>
                            <textarea
                                value={joinList(form.cons)}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, cons: splitList(e.target.value) }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[90px]"
                            />
                        </label>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={save}
                            className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                        >
                            Save tool
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

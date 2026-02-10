"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { isAdmin } from "@/lib/admin";
import type { Tool } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminHomePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);

            if (!u) {
                setTools([]);
                setLoading(false);
                return;
            }

            if (!isAdmin(({ email: u.email } as any))) {
                setTools([]);
                setLoading(false);
                return;
            }

            const q = query(collection(db, "tools"), orderBy("name"));
            const snap = await getDocs(q);
            const list = snap.docs.map((d) => d.data() as Tool).filter((t) => t?.id);
            setTools(list);

            setLoading(false);
        });

        return () => unsub();
    }, []);

    async function logout() {
        await signOut(auth);
        router.push("/");
        router.refresh();
    }

    if (loading) {
        return <div className="container mx-auto px-6 py-12">Loading…</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-3">Admin</h1>
                <p className="text-muted-foreground">Please sign in from /admin (Google).</p>
            </div>
        );
    }

    if (!isAdmin(({ email: user.email } as any))) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-3">Access denied</h1>
                <p className="text-muted-foreground mb-6">
                    Your email <span className="font-medium">{user.email}</span> is not in ADMIN_EMAILS.
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
        <div className="container mx-auto px-6 py-10 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/tools"
                        className="px-4 py-2 rounded-lg bg-muted font-semibold hover:bg-muted/80"
                    >
                        Manage Tools
                    </Link>
                    <Link
                        href="/admin/tools/new"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    >
                        + Add New Tool
                    </Link>
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-muted font-semibold hover:bg-muted/80"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="border border-border rounded-2xl bg-card p-5">
                <div className="font-semibold mb-3">Tools ({tools.length})</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tools.map((t) => (
                        <Link
                            key={t.id}
                            href={`/admin/tools/edit/${t.id}`}
                            className="p-4 rounded-xl border border-border hover:border-primary/50 transition"
                        >
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.id}</div>
                            <div className="text-xs mt-2">
                                <span className="px-2 py-1 rounded bg-muted">{t.category || "uncategorized"}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LibraryOnboarding() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem("jladan_library_seen");

        if (!seen) {
            setShow(true);
            localStorage.setItem("jladan_library_seen", "1");
        }
    }, []);

    if (!show) return null;

    return (
        <section className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Welcome to JLADAN Pro
                    </div>

                    <h2 className="mt-3 text-2xl font-extrabold">
                        Start here to get value fast
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        JLADAN contains systems and downloadable assets.
                        The fastest way to get value is to start with a system, then download the assets inside it.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/systems"
                        className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white text-center hover:opacity-95"
                    >
                        Start with a System
                    </Link>

                    <Link
                        href="/library"
                        className="rounded-2xl border border-border bg-background px-6 py-3 font-semibold text-center hover:bg-muted/30"
                    >
                        Browse Downloads
                    </Link>
                </div>
            </div>
        </section>
    );
}
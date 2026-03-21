"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function HeaderJladanCTA() {
    const { user } = useAuth();

    return (
        <div className="hidden lg:flex items-center gap-2">
            <Link
                href="/pricing"
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition"
            >
                JLADAN Pro
            </Link>

            {user ? (
                <Link
                    href="/library"
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted/30 transition"
                >
                    Library
                </Link>
            ) : null}
        </div>
    );
}
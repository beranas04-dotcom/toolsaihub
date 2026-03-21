"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { siteMetadata } from "@/lib/siteMetadata";
import { useState, useEffect, useRef } from "react";
import HeaderSearch from "@/components/search/HeaderSearch";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import { createPortal } from "react-dom";
import HeaderJladanCTA from "@/components/jladan/HeaderJladanCTA";
import {
    MoonIcon,
    SunIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    BellIcon,
} from "@heroicons/react/24/outline";

type ExtendedUser = {
    email?: string | null;
    photoURL?: string | null;
    plan?: "free" | "pro";
    isAdmin?: boolean;
};

export default function Header() {
    const { user: rawUser, signOut } = useAuth();
    const user = rawUser as ExtendedUser | null;

    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Tools", href: "/tools" },
        { name: "Categories", href: "/categories" },
        { name: "Best", href: "/best" },
        { name: "JLADAN", href: "/pricing" },
        { name: "Blog", href: "/blog" },
        { name: "Submit Tool", href: "/submit" },
        { name: "Promote", href: "/promote" },
        { name: "AI Kit", href: "/cashflow-kit" },
    ];

    // Scroll shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Click outside (profile + notif)
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lock scroll when drawer open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [mobileOpen]);

    async function handleLogout() {
        await signOut();
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/";
    }
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-md transition-all ${scrolled ? "bg-background/90 shadow-md" : "bg-background/95"
                }`}
        >
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative h-8 w-8">
                            <Image
                                src={siteMetadata.logo}
                                alt={siteMetadata.siteName}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            {siteMetadata.siteName}
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden lg:block">
                            <HeaderSearch />
                        </div>

                        <HeaderJladanCTA />

                        {/* Notifications */}
                        {user && (
                            <div ref={notifRef} className="relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2 text-muted-foreground hover:text-foreground"
                                >
                                    <BellIcon className="h-5 w-5" />
                                </button>

                                {notifOpen && (
                                    <div className="fixed top-16 right-4 left-4 sm:absolute sm:right-0 sm:left-auto sm:w-80 mt-2 rounded-xl shadow-lg bg-popover border border-border p-4 z-[1002]">
                                        <NotificationsDropdown />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Theme */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-muted-foreground hover:text-foreground"
                        >
                            {theme === "dark" ? (
                                <SunIcon className="h-5 w-5" />
                            ) : (
                                <MoonIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Profile */}
                        {user ? (
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="p-2 rounded-lg hover:bg-accent"
                                >
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt="User"
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-popover border border-border p-2 space-y-1 z-[1002]">
                                        <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                                            {user.email}
                                        </div>

                                        <ProfileLink href="/dashboard" label="Dashboard" />
                                        <ProfileLink
                                            href="/pricing"
                                            label="JLADAN Pro"
                                            highlight
                                        />
                                        <ProfileLink href="/library" label="Library" />
                                        <ProfileLink href="/systems" label="Systems" />
                                        <ProfileLink href="/downloads" label="Downloads" />

                                        {user.isAdmin && (
                                            <>
                                                <div className="border-t border-border my-2" />
                                                <ProfileLink
                                                    href="/admin"
                                                    label="Admin Dashboard"
                                                />
                                                <ProfileLink
                                                    href="/admin/analytics"
                                                    label="Analytics Dashboard"
                                                />
                                                <ProfileLink
                                                    href="/admin/sponsorships"
                                                    label="Sponsorships"
                                                />
                                            </>
                                        )}

                                        <div className="border-t border-border my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="hidden md:inline-flex px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Mobile button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2"
                        >
                            {mobileOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            {mounted && mobileOpen &&
                createPortal(
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Drawer */}
                        <div className="fixed top-0 right-0 h-full w-80 max-w-[85%] bg-background shadow-2xl z-[10000] flex flex-col">

                            {/* Top */}
                            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
                                <span className="text-lg font-semibold">Menu</span>
                                <button onClick={() => setMobileOpen(false)}>
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-3 py-2 rounded-lg text-base font-medium transition ${pathname === item.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {user && (
                                    <>
                                        <div className="border-t border-border my-4" />

                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                        >
                                            Dashboard
                                        </Link>

                                        <Link
                                            href="/library"
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                        >
                                            Library
                                        </Link>

                                        <Link
                                            href="/systems"
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                        >
                                            Systems
                                        </Link>

                                        <Link
                                            href="/downloads"
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                        >
                                            Downloads
                                        </Link>

                                        {user.isAdmin && (
                                            <>
                                                <div className="border-t border-border my-4" />
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                                >
                                                    Admin Dashboard
                                                </Link>

                                                <Link
                                                    href="/admin/sponsorships"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent"
                                                >
                                                    Sponsorships
                                                </Link>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </>,
                    document.body
                )
            }
        </header>
    );
}

function ProfileLink({
    href,
    label,
    highlight,
}: {
    href: string;
    label: string;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`block px-3 py-2 text-sm rounded-md hover:bg-accent ${highlight ? "font-semibold text-primary" : ""
                }`}
        >
            {label}
        </Link>
    );
}
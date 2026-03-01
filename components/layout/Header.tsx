"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { siteMetadata } from "@/lib/siteMetadata";
import { useState } from "react";
import HeaderSearch from "@/components/search/HeaderSearch";
import {
    MoonIcon,
    SunIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

function Header() {
    const { user, signOut: authSignOut } = useAuth(); // ✅ rename باش ما يكونش shadowing
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Tools", href: "/tools" },
        { name: "Categories", href: "/categories" },
        { name: "Best", href: "/best" },
        { name: "Blog", href: "/blog" },
        { name: "Submit Tool", href: "/submit" },
    ];

    async function handleLogout() {
        try {
            // 1) Firebase sign out (client)
            await authSignOut();

            // 2) Delete cookies (server) ✅ user + admin
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            // 3) redirect + refresh server components
            router.replace("/pricing");
            router.refresh();
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="relative h-8 w-8">
                                <Image
                                    src={siteMetadata.logo}
                                    alt={siteMetadata.siteName}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                {siteMetadata.siteName}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden lg:flex flex-1 justify-center">
                        <HeaderSearch />
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <SunIcon className="h-5 w-5" />
                            ) : (
                                <MoonIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* User menu */}
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || "User"}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-popover border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                                            {user.email}
                                        </div>

                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                        >
                                            Dashboard
                                        </Link>

                                        <Link
                                            href="/my-reviews"
                                            className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                        >
                                            My Reviews
                                        </Link>

                                        {user.isAdmin && (
                                            <>
                                                <div className="my-1 border-t border-border" />
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                >
                                                    Admin Dashboard
                                                </Link>
                                                <Link
                                                    href="/admin/tools"
                                                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                >
                                                    Manage Tools
                                                </Link>
                                                <Link
                                                    href="/admin/tools/new"
                                                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                >
                                                    New Tool
                                                </Link>
                                                <Link
                                                    href="/admin/submissions"
                                                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                >
                                                    Submissions
                                                </Link>
                                                <Link
                                                    href="/admin/reviews"
                                                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                >
                                                    Review Moderation
                                                </Link>
                                            </>
                                        )}

                                        <div className="my-1 border-t border-border" />

                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Mobile button */}
                        <button
                            type="button"
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="lg:hidden pb-3 pt-2">
                    <HeaderSearch />
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col space-y-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {!user && (
                                <Link
                                    href="/auth/signin"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;
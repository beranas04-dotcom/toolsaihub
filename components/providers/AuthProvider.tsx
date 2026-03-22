"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { User } from "@/types";
import { isAdmin } from "@/lib/admin";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            try {
                if (firebaseUser) {
                    const baseUser: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        isAdmin: false,
                    };

                    setUser({
                        ...baseUser,
                        isAdmin: isAdmin(baseUser),
                    });

                    // ✅ Create server session cookie
                    const idToken = await firebaseUser.getIdToken(true);

                    await fetch("/api/auth/session", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token: idToken }),
                    });
                } else {
                    setUser(null);

                    await fetch("/api/auth/logout", {
                        method: "POST",
                    });
                }
            } catch (err) {
                console.error("AUTH_PROVIDER_SESSION_ERROR:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await auth.signOut();

        await fetch("/api/auth/logout", {
            method: "POST",
        });

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
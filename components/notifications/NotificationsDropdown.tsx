"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = {
    id: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: number;
};

export default function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/notifications")
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data.notifications || []);
                setLoading(false);
            });
    }, []);

    async function markAsRead(id: string) {
        await fetch("/api/notifications/read", {
            method: "POST",
            body: JSON.stringify({ id }),
        });

        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    }

    if (loading) {
        return (
            <div className="p-4 text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!notifications.length) {
        return (
            <div className="p-4 text-sm text-muted-foreground">
                No notifications
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`p-3 rounded-lg border ${n.read ? "bg-muted/20" : "bg-primary/5 border-primary/30"
                        }`}
                >
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {n.message}
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                        {n.link ? (
                            <Link
                                href={n.link}
                                className="text-xs text-primary hover:underline"
                            >
                                Open
                            </Link>
                        ) : <span />}

                        {!n.read && (
                            <button
                                onClick={() => markAsRead(n.id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
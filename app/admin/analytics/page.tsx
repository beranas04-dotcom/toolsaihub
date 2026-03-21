"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type Metrics = {
    totalUsers: number;
    activeProUsers: number;
    totalDownloads: number;
    MRR: number;
    sponsorshipRequests: number;
    publishedTools: number;
};

type Growth = {
    monthlyPro: Record<string, number>;
};

export default function AdminAnalyticsPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [growth, setGrowth] = useState<Growth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/api/analytics");
            const data = await res.json();

            if (data.success) {
                setMetrics(data.metrics);
                setGrowth(data.growth);
            }

            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!metrics) return <div className="p-8">Error loading analytics</div>;

    const growthData =
        growth?.monthlyPro
            ? Object.entries(growth.monthlyPro).map(([month, count]) => ({
                month,
                count,
            }))
            : [];

    return (
        <div className="p-8 space-y-10">
            <h1 className="text-2xl font-bold">SaaS Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Users" value={metrics.totalUsers} />
                <MetricCard title="Active Pro Users" value={metrics.activeProUsers} />
                <MetricCard title="Total Downloads" value={metrics.totalDownloads} />
                <MetricCard title="Published Tools" value={metrics.publishedTools} />
                <MetricCard title="Sponsorship Requests" value={metrics.sponsorshipRequests} />
                <MetricCard title="MRR" value={`$${metrics.MRR}`} highlight />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">Pro Users Growth</h2>
                <div className="h-80 border border-border rounded-xl p-4 bg-background">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    highlight,
}: {
    title: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className={`rounded-xl border p-6 shadow-sm ${highlight ? "border-primary" : "border-border"
            }`}>
            <div className="text-sm text-muted-foreground mb-2">{title}</div>
            <div className={`text-3xl font-bold ${highlight ? "text-primary" : ""
                }`}>
                {value}
            </div>
        </div>
    );
}
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = getFirestore(adminApp);

        // 1️⃣ Total Users
        const usersSnap = await db.collection("users").get();
        const totalUsers = usersSnap.size;

        let activeProUsers = 0;
        let totalDownloads = 0;

        usersSnap.forEach((doc) => {
            const data = doc.data();

            // Count Pro Users
            if (data.subscription?.status === "active" && data.subscription?.plan === "pro") {
                activeProUsers++;
            }

            // Count Downloads
            if (data.stats?.downloads) {
                totalDownloads += data.stats.downloads;
            }
        });
        const monthlyPro: Record<string, number> = {};

        usersSnap.forEach((doc) => {
            const data = doc.data();

            if (
                data.subscription?.status === "active" &&
                data.subscription?.plan === "pro"
            ) {
                const ts = data.subscription?.updatedAt;
                if (ts) {
                    const date = new Date(ts);
                    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    monthlyPro[key] = (monthlyPro[key] || 0) + 1;
                }
            }
        });
        // 2️⃣ Estimated MRR ($5 per Pro user)
        const MRR = activeProUsers * 5;

        // 3️⃣ Sponsorship Requests
        const sponsorshipSnap = await db.collection("sponsorship_requests").get();
        const sponsorshipRequests = sponsorshipSnap.size;

        // 4️⃣ Published Tools
        const toolsSnap = await db.collection("tools")
            .where("status", "==", "published")
            .get();

        const publishedTools = toolsSnap.size;

        return NextResponse.json({
            success: true,
            metrics: {
                totalUsers,
                activeProUsers,
                totalDownloads,
                MRR,
                sponsorshipRequests,
                publishedTools,
            },
            growth: {
                monthlyPro,
            },
        });

    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
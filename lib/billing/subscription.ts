import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebaseAdmin";

export async function getSubscriptionStatus(uid: string) {
    const db = getFirestore(adminApp);

    const userDoc = await db.collection("users").doc(uid).get();
    console.log("UID RECEIVED:", uid);
    console.log("USER DATA:", userDoc.data());
    const userData = userDoc.data();
    console.log("USER DATA:", userData);
    if (!userData) {
        return { active: false, isAdmin: false };
    }

    const isAdmin = userData.isAdmin === true;

    const active =
        userData.subscription?.status === "active" &&
        userData.subscription?.plan === "pro";

    return {
        active,
        isAdmin,
        hasAccess: active || isAdmin,
    };
}
import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function isProUser(uid: string): Promise<boolean> {
    try {
        const db = getAdminDb();
        const snap = await db.collection("users").doc(uid).get();
        return snap.data()?.subscription?.status === "active";
    } catch {
        return false;
    }
}
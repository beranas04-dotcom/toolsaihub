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
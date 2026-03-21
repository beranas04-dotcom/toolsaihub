import { getAdminDb } from "@/lib/firebaseAdmin";

export async function createNotification(
    uid: string,
    data: {
        type: string;
        title: string;
        message: string;
        link?: string;
    }
) {
    const db = getAdminDb();

    await db
        .collection("users")
        .doc(uid)
        .collection("notifications")
        .add({
            ...data,
            read: false,
            createdAt: Date.now(),
        });
}

export async function getUserNotifications(uid: string) {
    const db = getAdminDb();

    const snap = await db
        .collection("users")
        .doc(uid)
        .collection("notifications")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    }));
}
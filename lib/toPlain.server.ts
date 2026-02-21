// lib/toPlain.server.ts
import "server-only";
import { Timestamp } from "firebase-admin/firestore";

export function toPlain<T>(value: T): any {
    if (value === null || value === undefined) return value;

    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();

    if (Array.isArray(value)) return value.map((v) => toPlain(v));

    if (typeof value === "object") {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(value as any)) out[k] = toPlain(v);
        return out;
    }

    return value;
}

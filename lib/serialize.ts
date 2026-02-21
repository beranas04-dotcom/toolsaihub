// lib/serialize.ts
import { Timestamp } from "firebase-admin/firestore";

/**
 * Convert Firestore/Admin SDK objects (Timestamp, etc.) into plain JSON-safe values.
 * Safe to use in Server Components before passing props to Client Components.
 */
export function toPlain<T>(value: T): any {
    if (value === null || value === undefined) return value;

    // Firestore Timestamp (Admin)
    if (value instanceof Timestamp) {
        return value.toDate().toISOString();
    }

    // Date
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Array
    if (Array.isArray(value)) {
        return value.map((v) => toPlain(v));
    }

    // Plain object
    if (typeof value === "object") {
        const obj = value as Record<string, any>;

        // Avoid passing special objects like DocumentReference by stringifying safe parts
        // If it has a "path" (DocumentReference), keep only the path
        if (typeof (obj as any).path === "string" && Object.keys(obj).length <= 5) {
            // keep it as string path if it looks like a ref
            // comment this out if you don't use refs in your data
            return (obj as any).path;
        }

        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) out[k] = toPlain(v);
        return out;
    }

    // primitives
    return value;
}

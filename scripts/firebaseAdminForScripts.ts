// scripts/firebaseAdminForScripts.ts

import { getAdminDb } from "../lib/firebaseAdmin";

/**
 * Used only by scripts (upsertTools, etc.)
 * Relies on the unified Firebase Admin init.
 */
export function getDbForScripts() {
    return getAdminDb();
}

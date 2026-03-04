import { google } from "googleapis";

function decodeB64(b64: string) {
    return Buffer.from(b64, "base64").toString("utf8");
}

export function getDriveClient() {
    const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const pkB64 = process.env.GOOGLE_DRIVE_PRIVATE_KEY_B64;

    if (!clientEmail || !pkB64) {
        throw new Error("Missing GOOGLE_DRIVE_CLIENT_EMAIL or GOOGLE_DRIVE_PRIVATE_KEY_B64");
    }

    const privateKey = decodeB64(pkB64).replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    return google.drive({ version: "v3", auth });
}
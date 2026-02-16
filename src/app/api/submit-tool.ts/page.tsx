import type { Metadata } from "next";
import SubmitToolClient from "@/components/submit/SubmitToolClient";

export const metadata: Metadata = {
    title: "Submit an AI Tool",
    description: "Submit your AI tool to AIToolsHub for review.",
};

export default function SubmitToolPage() {
    return <SubmitToolClient />;
}

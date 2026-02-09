"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmission } from "@/lib/firestore";
import { trackEvent } from "@/lib/analytics";

export default function SubmitPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        tagline: "",
        description: "",
        category: "",
        pricing: "Freemium",
        email: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createSubmission({
                toolName: formData.name,
                websiteUrl: formData.website,
                description: formData.description,
                category: formData.category,
                submitterEmail: formData.email,
                status: "pending",
                createdAt: new Date().toISOString(),
            } as any);

            // ✅ Track success submit
            trackEvent("submit_tool", {
                tool_name: formData.name,
                category: formData.category,
                pricing: formData.pricing,
                source: "submit_page",
            });

            setSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="container mx-auto px-4 py-24 max-w-2xl text-center">
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🎉</span>
                </div>
                <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
                <p className="text-muted-foreground mb-8">
                    Thank you for submitting <strong>{formData.name}</strong>. Our team will
                    review it shortly.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg"
                >
                    Back to Home
                </button>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Submit a Tool</h1>
                <p className="text-muted-foreground">
                    Share your AI tool with thousands of daily visitors.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-card border border-border p-8 rounded-xl shadow-sm"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tool Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="e.g. CopyCraft"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Website URL *</label>
                        <input
                            type="url"
                            name="website"
                            required
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tagline *</label>
                    <input
                        type="text"
                        name="tagline"
                        required
                        value={formData.tagline}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Short catchy description (max 100 chars)"
                        maxLength={100}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Detailed explanation of what the tool does..."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category *</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Select a category</option>
                            <option value="Writing">Writing</option>
                            <option value="Images">Images</option>
                            <option value="Video">Video</option>
                            <option value="Audio">Audio</option>
                            <option value="Coding">Coding</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pricing *</label>
                        <select
                            name="pricing"
                            required
                            value={formData.pricing}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="Free">Free</option>
                            <option value="Freemium">Freemium</option>
                            <option value="Paid">Paid</option>
                            <option value="Free Trial">Free Trial</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Email *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="For update notifications"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                    {isSubmitting ? "Submitting..." : "Submit Tool"}
                </button>
            </form>
        </main>
    );
}

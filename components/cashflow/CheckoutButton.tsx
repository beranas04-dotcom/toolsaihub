"use client";

type CheckoutButtonProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
    source?: string;
};

export default function CheckoutButton({
    href,
    children,
    className = "",
    source = "cashflow_kit_page",
}: CheckoutButtonProps) {
    const handleClick = () => {
        if (typeof window !== "undefined") {
            const gtag = (window as any).gtag;

            if (typeof gtag === "function") {
                gtag("event", "cashflow_checkout_click", {
                    event_category: "ecommerce",
                    event_label: source,
                    value: 19,
                    product_name: "AI Cashflow Launch Kit",
                    product_slug: "ai-cashflow-launch-kit",
                });
            }
        }
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={className}
        >
            {children}
        </a>
    );
}
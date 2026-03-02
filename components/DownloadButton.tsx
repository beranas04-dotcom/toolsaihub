"use client";

export default function DownloadButton({
    productId,
    className,
    label = "Download",
}: {
    productId: string;
    className?: string;
    label?: string;
}) {
    return (
        <button
            onClick={() => {
                console.log("CLICK DOWNLOAD", productId);
                window.location.href = `/api/download?productId=${encodeURIComponent(productId)}`;
            }}
            className={className}
        >
            {label}
        </button>
    );
}
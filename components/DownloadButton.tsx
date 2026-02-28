"use client";

type Props = {
    url: string;
    label?: string;
    className?: string;
};

export default function DownloadButton({ url, label = "Download", className = "" }: Props) {
    return (
        <button
            type="button"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            className={className}
        >
            {label}
        </button>
    );
}
type Props = {
    label?: string | null;
};

export default function SponsoredBadge({ label }: Props) {
    return (
        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            {label || "Sponsored"}
        </span>
    );
}
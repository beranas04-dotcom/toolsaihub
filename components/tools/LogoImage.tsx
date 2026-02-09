"use client";

import { useState } from "react";

type Props = {
    src?: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
};

export default function LogoImage({
    src,
    alt,
    className,
    fallbackSrc = "/logo.svg",
}: Props) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setImgSrc(fallbackSrc)}
            loading="lazy"
        />
    );
}

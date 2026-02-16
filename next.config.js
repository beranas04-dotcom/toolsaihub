/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    images: {
        remotePatterns: [
            // Unsplash
            { protocol: "https", hostname: "images.unsplash.com" },

            // Placeholders
            { protocol: "https", hostname: "via.placeholder.com" },

            // Google avatars (sign-in)
            { protocol: "https", hostname: "lh3.googleusercontent.com" },

            // Firebase Storage (logos/uploads)
            { protocol: "https", hostname: "firebasestorage.googleapis.com" },

            // GitHub (logos from repos)
            { protocol: "https", hostname: "raw.githubusercontent.com" },
            { protocol: "https", hostname: "github.com" },
            { protocol: "https", hostname: "avatars.githubusercontent.com" },

            // Common CDNs people use for logos
            { protocol: "https", hostname: "cdn.jsdelivr.net" },
            { protocol: "https", hostname: "unpkg.com" },

            // Cloudinary (if you ever use it)
            { protocol: "https", hostname: "res.cloudinary.com" },

            // UI Avatars (fallback logos)
            { protocol: "https", hostname: "ui-avatars.com" },

            // Simple icon sources (optional but useful)
            { protocol: "https", hostname: "www.google.com" }, // sometimes for favicons
            { protocol: "https", hostname: "logo.clearbit.com" },
        ],
    },

    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-DNS-Prefetch-Control", value: "on" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "origin-when-cross-origin" },
                ],
            },
        ];
    },

    async redirects() {
        return [
            { source: "/category/:slug", destination: "/categories/:slug", permanent: true },
            { source: "/tool/:id", destination: "/tools/:id", permanent: true },
        ];
    },
};

module.exports = nextConfig;

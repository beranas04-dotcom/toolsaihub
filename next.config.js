/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["images.unsplash.com", "via.placeholder.com", "lh3.googleusercontent.com"],
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

import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { siteMetadata } from "@/lib/siteMetadata";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
        default: siteMetadata.title,
        template: `%s | ${siteMetadata.siteName}`,
    },
    description: siteMetadata.description,
    keywords: [
        "AI tools",
        "artificial intelligence",
        "productivity",
        "automation",
        "machine learning",
        "AI directory",
    ],
    authors: [{ name: siteMetadata.author.name }],
    creator: siteMetadata.author.name,
    publisher: siteMetadata.siteName,

    verification: {
        google: "MOrR4sWVIJWPXe-ax4xER-leVq0nIN_zpAEi9-ZaYdc",
    },

    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: siteMetadata.locale,
        url: siteMetadata.siteUrl,
        title: siteMetadata.title,
        description: siteMetadata.description,
        siteName: siteMetadata.siteName,
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: siteMetadata.siteName,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteMetadata.title,
        description: siteMetadata.description,
        creator: siteMetadata.social.twitter,
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: siteMetadata.favicon,
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${outfit.variable}`}
        >
            <body className="min-h-screen flex flex-col font-sans antialiased">
                <ThemeProvider>
                    <AuthProvider>
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </AuthProvider>
                </ThemeProvider>

                {/* Google Analytics (only if NEXT_PUBLIC_GA_ID is set) */}
                {GA_ID ? (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga-init" strategy="afterInteractive">
                            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
                        </Script>
                    </>
                ) : null}

                {/* Site-wide JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify([
                            {
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                name: siteMetadata.siteName,
                                url: siteMetadata.siteUrl,
                                logo: `${siteMetadata.siteUrl}/logo.png`,
                                sameAs: [
                                    `https://twitter.com/${siteMetadata.social.twitter.replace(
                                        "@",
                                        ""
                                    )}`,
                                    `https://github.com/${siteMetadata.social.github}`,
                                ],
                                contactPoint: {
                                    "@type": "ContactPoint",
                                    email: siteMetadata.author.email,
                                    contactType: "customer support",
                                },
                            },
                            {
                                "@context": "https://schema.org",
                                "@type": "WebSite",
                                name: siteMetadata.siteName,
                                url: siteMetadata.siteUrl,
                                potentialAction: {
                                    "@type": "SearchAction",
                                    target: `${siteMetadata.siteUrl}/search?q={search_term_string}`,
                                    "query-input": "required name=search_term_string",
                                },
                            },
                        ]),
                    }}
                />
            </body>
        </html>
    );
}

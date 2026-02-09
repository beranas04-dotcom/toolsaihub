export const siteMetadata = {
    title: "AIToolsHub — Find, compare, and review the best AI tools for creators and teams",
    description: "Find, compare, and review the best AI tools for creators and teams.",
    tagline: "Find, compare, and review the best AI tools for creators, teams, and students — updated weekly.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolshub.com",
    siteName: "AIToolsHub",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    author: {
        name: "AIToolsHub Team",
        email: "hello@aitoolshub.com",
    },
    social: {
        twitter: "@aitoolshub",
        github: "beranas04-dotcom/aitoolshub",
    },
    locale: "en-US",
    analytics: {
        googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    },
};

export default siteMetadata;

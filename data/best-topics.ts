export interface Topic {
    slug: string;
    title: string;
    description: string;
    keyword?: string;
    category?: string;
    match?: {
        categories?: string[];
        tags?: string[];
    };
    curatedToolIds?: string[]; // ✅ جديد
}

export const topics: Topic[] = [
    {
        slug: "students",
        title: "Best AI Tools for Students",
        description:
            "Boost your academic performance with these top-rated AI tools for students. From writing assistance to study planners, find the perfect software to help you succeed.",
        curatedToolIds: [
            "notion-ai",
            "perplexity-ai",
            "consensus",
            "writesonic",
            "copy-ai",
            "otterai",
            "prompthub",
            "promptbase-lite",
            "replitai",
        ],
        // match نخليه fallback إذا شي id ماكانش موجود فـ tools.json
        match: {
            categories: ["writing", "research", "productivity", "utilities", "code"],
            tags: ["education", "study", "students", "learning", "notes", "pdf", "summaries"],
        },
    },

    {
        slug: "free",
        title: "Best Free AI Tools",
        description:
            "Explore the best free AI tools you can use today. From writing and design to productivity and research, these tools offer powerful features at no cost.",
        curatedToolIds: [
            "writesonic",
            "copy-ai",
            "canva",
            "runwayml",
            "otterai",
            "replitai",
            "perplexity-ai",
            "prompthub",
            "synthdocs",
        ],
        match: {
            categories: ["writing", "images", "video", "productivity", "code", "research", "utilities", "developer-tools"],
            tags: ["free", "freemium", "trial", "open-source", "opensource"],
        },
    },

    {
        slug: "teachers",
        title: "Best AI Tools for Teachers",
        description:
            "Discover the best AI tools for teachers to plan lessons, create quizzes, grade faster, generate worksheets, and support students with personalized learning.",
        curatedToolIds: [
            "canva",
            "synthesia-lite",
            "pictory",
            "runwayml",
            "murf",
            "elevenlabs-voice",
            "playht",
            "notion-ai",
        ],
        match: {
            categories: ["writing", "research", "productivity", "utilities", "video", "audio", "images"],
            tags: ["teachers", "education", "lesson", "worksheet", "quiz", "grading", "classroom", "presentation"],
        },
    },

    // باقي المواضيع خليتهم كيخدمو بنفس match القديم ديالك
    {
        slug: "marketers",
        title: "Best AI Tools for Marketers",
        description:
            "Supercharge your marketing campaigns with AI. Discover tools for copywriting, analytics, and social media automation designed to maximize your ROI.",
        match: {
            categories: ["marketing", "writing"],
            tags: ["marketing", "ads", "seo", "analytics"],
        },
    },
    {
        slug: "content-creators",
        title: "Best AI Tools for Content Creators",
        description:
            "Streamline your creative workflow. Whether you blog, vlog, or post on social media, these AI tools help you create high-quality content faster.",
        match: {
            categories: ["writing", "video", "images", "audio"],
            tags: ["content", "creation", "social", "blogging"],
        },
    },
    {
        slug: "designers",
        title: "Best AI Tools for Designers",
        description:
            "Unlock new creative possibilities. Explore AI-powered design tools for image generation, editing, and layout that complement your artistic skills.",
        match: {
            categories: ["images"],
            tags: ["design", "art", "graphics", "ui"],
        },
    },
    {
        slug: "developers",
        title: "Best AI Tools for Developers",
        description:
            "Code faster and cleaner. Find the best AI coding assistants, code generators, and debugging tools to enhance your development workflow.",
        match: {
            categories: ["code", "developer-tools"],
            tags: ["coding", "programming", "development", "dev"],
        },
    },
    {
        slug: "video-editing",
        title: "Best AI Tools for Video Editing",
        description:
            "Create professional videos in minutes. These AI video editors and generators automate tedious tasks like trimming, captioning, and transitions.",
        match: {
            categories: ["video"],
            tags: ["video", "editing", "production"],
        },
    },
    {
        slug: "podcasters",
        title: "Best AI Tools for Podcasters",
        description:
            "Elevate your audio production. Discover AI tools for audio editing, voice enhancement, transcription, and sound engineering.",
        match: {
            categories: ["audio"],
            tags: ["podcast", "voice", "speech", "audio"],
        },
    },
    {
        slug: "ecommerce",
        title: "Best AI Tools for Ecommerce",
        description:
            "Drive sales and optimize your store. These AI tools help with product descriptions, customer support, and inventory management.",
        match: {
            categories: ["marketing", "writing"],
            tags: ["ecommerce", "sales", "retail", "product"],
        },
    },
    {
        slug: "startups",
        title: "Best AI Tools for Startups",
        description:
            "Scale your business efficiently. Essential AI tools for productivity, management, and growth hacking specifically curated for startups.",
        match: {
            categories: ["productivity", "marketing", "writing"],
            tags: ["startup", "business", "growth", "management"],
        },
    },
    {
        slug: "productivity",
        title: "Best AI Tools for Productivity",
        description:
            "Get more done in less time. Explore the ultimate collection of AI productivity tools for task management, scheduling, and workflow automation.",
        match: {
            categories: ["productivity", "utilities"],
            tags: ["productivity", "organization", "time", "workflow"],
        },
    },
];

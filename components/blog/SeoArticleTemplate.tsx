import Link from 'next/link';
import { defaultAuthor } from '@/lib/author';

interface Section {
    title: string;
    content: string; // Markdown supported
}

interface FAQ {
    question: string;
    answer: string;
}

interface SeoArticleTemplateProps {
    title: string;
    intro: string;
    sections: Section[];
    faq?: FAQ[];
    updatedDate?: string;
}

export default function SeoArticleTemplate({
    title,
    intro,
    sections,
    faq,
    updatedDate = new Date().toISOString()
}: SeoArticleTemplateProps) {
    return (
        <article className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <header className="mb-10 text-center">
                <nav className="flex justify-center flex-wrap gap-4 mb-6 text-sm">
                    <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                        ← Blog
                    </Link>
                    <span className="text-border">|</span>
                    <Link href="/best" className="text-muted-foreground hover:text-primary transition-colors">
                        Best Collections
                    </Link>
                </nav>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {title}
                </h1>

                <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                    <img src={defaultAuthor.avatar} alt={defaultAuthor.name} className="w-6 h-6 rounded-full" />
                    <span>By {defaultAuthor.name}</span>
                    <span className="mx-2">•</span>
                    <span>Updated {new Date(updatedDate).toLocaleDateString()}</span>
                </div>
            </header>

            {/* Intro */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <p className="lead text-xl text-muted-foreground">
                    {intro}
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-12 mb-16">
                {sections.map((section, idx) => (
                    <section key={idx} className="prose prose-lg dark:prose-invert max-w-none">
                        <h2>{section.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        {/* Note: In real usage, pass content through a markdown parser before rendering or use ReactMarkdown here if content is raw MD */}
                    </section>
                ))}
            </div>

            {/* FAQ */}
            {faq && faq.length > 0 && (
                <section className="bg-muted/30 rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faq.map((item, idx) => (
                            <div key={idx}>
                                <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                                <p className="text-muted-foreground">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Discover More AI Tools</h2>
                <div className="flex justify-center gap-4">
                    <Link href="/tools" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90">
                        Browse Directory
                    </Link>
                </div>
            </div>
        </article>
    );
}

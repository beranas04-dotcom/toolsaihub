'use client';

import { useState, useMemo } from 'react';
import { Tool } from '@/types';
import ToolCard from './ToolCard';

export default function ToolsExplorer({ tools }: { tools: Tool[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set(tools.map((t) => t.category).filter(Boolean));
        return ['All', ...Array.from(cats)].sort();
    }, [tools]);

    const filteredTools = useMemo(() => {
        return tools.filter((tool) => {
            const matchesSearch =
                tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tool.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [tools, searchTerm, activeCategory]);

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-center md:text-left">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="category-select" className="text-sm font-medium">Category:</label>
                    <select
                        id="category-select"
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No tools found matching your criteria.
                </div>
            )}
        </div>
    );
}

import { topics as curatedTopics, Topic } from '@/data/best-topics';
import { programmaticTopics } from '@/data/programmatic-topics';

export type { Topic };

export function getAllTopics(): Topic[] {
    // Combine curated and programmatic topics
    // Filter out duplicates based on slug just in case
    const all = [...curatedTopics, ...programmaticTopics];
    const unique = new Map();

    all.forEach(topic => {
        unique.set(topic.slug, topic);
    });

    return Array.from(unique.values());
}

export function getPaginatedTopics(page: number, limit: number = 20) {
    const all = getAllTopics();
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
        topics: all.slice(start, end),
        total: all.length,
        totalPages: Math.ceil(all.length / limit),
        currentPage: page
    };
}

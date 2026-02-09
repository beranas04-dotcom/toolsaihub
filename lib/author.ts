export interface Author {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    url: string;
}

export const defaultAuthor: Author = {
    name: "Alex Morgan",
    role: "Senior Tech Editor",
    bio: "Alex is a software engineer and AI enthusiast with over 10 years of experience in tech. He loves exploring the latest developments in machine learning and helping others optimize their workflows.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    url: "https://twitter.com/alexmorgan_tech" // hypothetical
};

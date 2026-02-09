import { getAllTools } from "./toolsRepo";
import type { Tool } from "@/types";

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
    const tools = (await getAllTools()) as Tool[];

    return tools
        .filter((t) => t.featured === true)
        .sort((a, b) => {
            const ad = a.lastUpdated ? Date.parse(a.lastUpdated) : 0;
            const bd = b.lastUpdated ? Date.parse(b.lastUpdated) : 0;
            return bd - ad;
        })
        .slice(0, limit);
}

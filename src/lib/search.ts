// src/lib/search.ts
import type { Source } from "@/types";

const TAVILY_API_URL = "https://api.tavily.com/search";

export async function webSearch(query: string): Promise<Source[]> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY not set — skipping web search");
    return [];
  }

  try {
    const res = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);

    const data = await res.json();

    return (data.results || []).map((r: {
      title: string;
      url: string;
      content: string;
    }) => ({
      title: r.title || "Untitled",
      url: r.url,
      snippet: r.content?.slice(0, 200) || "",
      favicon: `https://www.google.com/s2/favicons?sz=32&domain=${new URL(r.url).hostname}`,
    }));
  } catch (err) {
    console.error("Web search failed:", err);
    return [];
  }
}

export function buildSearchContext(sources: Source[]): string {
  if (!sources.length) return "";
  return sources
    .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet}`)
    .join("\n\n");
}

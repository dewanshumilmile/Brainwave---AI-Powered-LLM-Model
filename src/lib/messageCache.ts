// src/lib/messageCache.ts
import type { Message } from "@/types";

// Module-level cache — persists across navigation
const cache = new Map<string, { messages: Message[]; time: number }>();
const CACHE_TTL = 60_000; // 1 minute

export const messageCache = {
  get(convId: string): Message[] | null {
    const entry = cache.get(convId);
    if (!entry) return null;
    if (Date.now() - entry.time > CACHE_TTL) {
      cache.delete(convId);
      return null;
    }
    return entry.messages;
  },

  set(convId: string, messages: Message[]) {
    cache.set(convId, { messages, time: Date.now() });
  },

  invalidate(convId: string) {
    cache.delete(convId);
  },

  // Prefetch and cache a conversation in background
  async prefetch(convId: string) {
    if (cache.has(convId)) return; // already cached
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      const messages: Message[] = data.messages.map((m: Message) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        sources: m.sources || [],
      }));
      messageCache.set(convId, messages);
    } catch { /* silent fail */ }
  },
};
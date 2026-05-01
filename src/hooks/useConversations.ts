// src/hooks/useConversations.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Conversation } from "@/types";

// Module-level cache so data persists across re-renders and navigation
let cache: Conversation[] = [];
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(cache);
  const [loading, setLoading] = useState(cache.length === 0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Subscribe to global updates
    const update = () => {
      if (mountedRef.current) setConversations([...cache]);
    };
    listeners.add(update);

    // Only fetch if cache is stale
    const isStale = Date.now() - cacheTime > CACHE_TTL;
    if (isStale) {
      fetchConversations();
    } else {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
      listeners.delete(update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      cache = data;
      cacheTime = Date.now();
      if (mountedRef.current) {
        setConversations([...cache]);
      }
      notifyAll();
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // Optimistically add a new conversation immediately
  function addConversation(conv: Conversation) {
    cache = [conv, ...cache];
    cacheTime = Date.now();
    notifyAll();
  }

  // Optimistically update title
  function updateTitle(id: string, title: string) {
    cache = cache.map((c) => (c.id === id ? { ...c, title } : c));
    notifyAll();
  }

  const deleteConv = useCallback(async (id: string) => {
    // Optimistic delete — remove immediately
    cache = cache.filter((c) => c.id !== id);
    notifyAll();
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Failed to delete");
      // Refetch to restore on error
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renameConv = useCallback(async (id: string, title: string) => {
    // Optimistic rename
    updateTitle(id, title);
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      toast.error("Failed to rename");
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    conversations,
    loading,
    deleteConv,
    renameConv,
    addConversation,
    refresh: fetchConversations,
  };
}
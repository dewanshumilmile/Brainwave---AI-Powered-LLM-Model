// src/hooks/useChat.ts
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { Message, Source, UploadedFile } from "@/types";

export function useChat(initialConvId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, useWebSearch: boolean, uploadedFile?: UploadedFile | null) => {
      if (!text.trim() || streaming) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date(),
        ...(uploadedFile && { fileContext: uploadedFile.name }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);
      setStreamingText("");
      setStreamingSources([]);

      try {
        const body = {
          message: text,
          conversationId,
          useWebSearch,
          ...(uploadedFile?.type !== "image" && { fileContext: uploadedFile?.extractedText }),
          ...(uploadedFile?.type === "image" && { imageBase64: uploadedFile.base64 }),
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Request failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let finalConvId = conversationId;
        let finalSources: Source[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === "meta") {
                finalConvId = parsed.conversationId;
                setConversationId(parsed.conversationId);
              } else if (parsed.type === "sources") {
                finalSources = parsed.sources;
                setStreamingSources(parsed.sources);
                if (!conversationId) setConversationId(parsed.conversationId);
              } else if (parsed.type === "text") {
                accumulated += parsed.content;
                setStreamingText(accumulated);
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            } catch { /* skip malformed */ }
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: accumulated,
            sources: finalSources,
            createdAt: new Date(),
          },
        ]);
        setConversationId(finalConvId);
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        toast.error((err as Error).message || "Something went wrong");
      } finally {
        setStreaming(false);
        setStreamingText("");
        setStreamingSources([]);
      }
    },
    [streaming, conversationId]
  );

  const loadHistory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(
        data.messages.map((m: Message) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          sources: m.sources || [],
        }))
      );
      setConversationId(id);
    } catch {
      toast.error("Failed to load conversation");
    }
  }, []);

  return { messages, streaming, streamingText, streamingSources, conversationId, sendMessage, loadHistory, setMessages };
}

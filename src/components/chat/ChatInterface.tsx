// src/components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { SearchBar } from "./SearchBar";
import { SkeletonMessage } from "./SkeletonMessage";
import { ExportButton } from "./ExportButton";
import { FollowUpSuggestions } from "./FollowUpSuggestions";
import { useConversations } from "@/hooks/useConversations";
import { messageCache } from "@/lib/messageCache";
import type { Message, Source, UploadedFile } from "@/types";

const SUGGESTED = [
  "What are the latest breakthroughs in AI?",
  "Explain how React Server Components work",
  "Summarize the history of the internet",
  "What is the best way to learn DSA?",
];

export function ChatInterface() {
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(convId);
  const [loadingHistory, setLoadingHistory] = useState(!!convId);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { addConversation } = useConversations();

  // Load history when convId changes
  useEffect(() => {
    if (convId) {
      setCurrentConvId(convId);
      loadHistory(convId);
    } else {
      setMessages([]);
      setCurrentConvId(undefined);
      setLoadingHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId]);

  // Auto scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function loadHistory(id: string) {
    // Show cached messages instantly if available
    const cached = messageCache.get(id);
    if (cached) {
      setMessages(cached);
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const msgs: Message[] = data.messages.map((m: Message) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        sources: m.sources || [],
      }));
      messageCache.set(id, msgs);
      setMessages(msgs);
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleSend = useCallback(
    async (text: string, useWebSearch: boolean) => {
      if (!text.trim() || streaming) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Optimistic user message
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
          conversationId: currentConvId,
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
        let finalConvId = currentConvId;
        let finalSources: Source[] = [];
        let isNewConversation = !currentConvId;

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
                setCurrentConvId(parsed.conversationId);

                // Instantly add to sidebar without waiting
                if (isNewConversation && parsed.conversationId) {
                  addConversation({
                    id: parsed.conversationId,
                    title: text.slice(0, 60),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                  isNewConversation = false;
                  // Update URL without full page reload
                  router.replace(
                    `/dashboard/chat/${parsed.conversationId}`,
                    { scroll: false }
                  );
                }
              } else if (parsed.type === "sources") {
                finalSources = parsed.sources;
                setStreamingSources(parsed.sources);
              } else if (parsed.type === "text") {
                accumulated += parsed.content;
                setStreamingText(accumulated);
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            } catch { /* skip malformed lines */ }
          }
        }

        // Commit final AI message
        const finalMessages = (prev: Message[]) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: accumulated,
            sources: finalSources,
            createdAt: new Date(),
          },
        ];

        setMessages((prev) => {
          const updated = finalMessages(prev);
          // Update cache with latest messages
          if (finalConvId) messageCache.set(finalConvId, updated);
          return updated;
        });

        setCurrentConvId(finalConvId);
        setUploadedFile(null);
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        toast.error((err as Error).message || "Something went wrong");
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      } finally {
        setStreaming(false);
        setStreamingText("");
        setStreamingSources([]);
      }
    },
    [streaming, currentConvId, uploadedFile, addConversation, router]
  );

  const isEmpty = messages.length === 0 && !streaming && !loadingHistory;

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="mx-auto max-w-3xl px-4 pt-8 space-y-6">
            <SkeletonMessage />
            <SkeletonMessage align="right" />
            <SkeletonMessage />
          </div>
        ) : isEmpty ? (
          <EmptyState onSuggest={handleSend} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble message={msg} />

                  {/* Follow-up suggestions — only on last assistant message */}
                  {msg.role === "assistant" &&
                    index === messages.length - 1 &&
                    !streaming && (
                      <FollowUpSuggestions
                        content={msg.content}
                        onSelect={(q) => handleSend(q, true)}
                      />
                    )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming response */}
            {streaming && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingText,
                    sources: streamingSources,
                    createdAt: new Date(),
                  }}
                  isStreaming
                />
              </motion.div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <SearchBar
            onSend={handleSend}
            disabled={streaming}
            uploadedFile={uploadedFile}
            onFileUpload={setUploadedFile}
            onFileClear={() => setUploadedFile(null)}
          />
          <div className="mt-2 flex items-center justify-between">
            <ExportButton messages={messages} title="Brainwave Chat" />
            <p className="text-xs text-muted-foreground text-center flex-1">
              Brainwave can make mistakes. Verify important information.
            </p>
            <div className="w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onSuggest,
}: {
  onSuggest: (q: string, ws: boolean) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-full px-4 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold mb-2">What do you want to know?</h2>
      <p className="text-muted-foreground mb-8 max-w-sm text-sm">
        Ask anything. Upload documents. I&apos;ll search the web and give you
        cited answers.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 max-w-xl w-full">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => onSuggest(q, true)}
            className="rounded-xl border bg-card px-4 py-3 text-left text-sm
                       hover:bg-accent transition-colors shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
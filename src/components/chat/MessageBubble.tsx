// src/components/chat/MessageBubble.tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, Share2, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SourceCards } from "./SourceCards";
import type { Message } from "@/types";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser && "flex justify-end")}>
        {/* File/image indicator */}
        {message.fileContext && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
            📎 {message.fileContext}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 max-w-full",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/50 rounded-tl-sm border"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose-ai">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom code block with copy button
                  pre({ children, ...props }) {
                    return (
                      <div className="relative group">
                        <pre {...props}>{children}</pre>
                        <CopyCodeButton content={String(children)} />
                      </div>
                    );
                  },
                  // Open links in new tab
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content || ""}
              </ReactMarkdown>
              {/* Blinking cursor while streaming */}
              {isStreaming && !message.content && (
                <span className="inline-block h-4 w-0.5 bg-foreground animate-pulse" />
              )}
              {isStreaming && message.content && (
                <span className="inline-block h-4 w-0.5 bg-foreground animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <SourceCards sources={message.sources} />
          </div>
        )}

        {/* AI message actions */}
        {!isUser && !isStreaming && message.content && (
          <div className="mt-2 flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyCodeButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

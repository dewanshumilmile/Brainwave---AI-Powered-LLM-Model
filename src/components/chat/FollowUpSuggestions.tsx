// src/components/chat/FollowUpSuggestions.tsx
"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  onSelect: (question: string) => void;
}

export function FollowUpSuggestions({ content, onSelect }: Props) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  async function fetchQuestions() {
    try {
      setError(false);
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      setError(true);
      setQuestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  async function handleRefresh() {
    setRefreshing(true);
    setQuestions([]);
    await fetchQuestions();
  }

  // Don't render anything if error or no questions
  if (!loading && (error || questions.length === 0)) return null;

  return (
    <div className="mt-4 rounded-xl border bg-muted/30 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Follow-up suggestions
          </span>
        </div>

        {/* Refresh button */}
        {!loading && questions.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Regenerate suggestions"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {(loading || refreshing) && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton h-8 rounded-lg"
              style={{ width: `${75 + i * 8}%` }}
            />
          ))}
        </div>
      )}

      {/* Questions */}
      {!loading && !refreshing && questions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelect(q)}
              className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2
                         text-xs text-left hover:bg-accent hover:border-primary/40
                         transition-all active:scale-[0.98]"
            >
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-blue-500
                           group-hover:translate-x-0.5 transition-transform"
              />
              <span className="flex-1">{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
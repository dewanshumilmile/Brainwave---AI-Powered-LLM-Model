// src/components/chat/PromptTemplates.tsx
"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const TEMPLATES = [
  { label: "Summarize", prompt: "Summarize the following in bullet points:", emoji: "📝" },
  { label: "Explain simply", prompt: "Explain this like I'm 5 years old:", emoji: "🧒" },
  { label: "Write code", prompt: "Write clean, commented code for:", emoji: "💻" },
  { label: "Compare", prompt: "Compare and contrast the following:", emoji: "⚖️" },
  { label: "Pros & Cons", prompt: "List the pros and cons of:", emoji: "📊" },
  { label: "Step by step", prompt: "Explain step by step how to:", emoji: "🪜" },
  { label: "Interview Q&A", prompt: "Generate interview questions and answers about:", emoji: "🎯" },
  { label: "Fix my code", prompt: "Find bugs and fix this code:", emoji: "🐛" },
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function PromptTemplates({ onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? TEMPLATES : TEMPLATES.slice(0, 4);

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-medium text-muted-foreground">Quick prompts</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((t) => (
          <button
            key={t.label}
            onClick={() => onSelect(t.prompt + " ")}
            className="flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-medium hover:bg-accent hover:border-primary/40 transition-all"
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:bg-accent transition-all"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}
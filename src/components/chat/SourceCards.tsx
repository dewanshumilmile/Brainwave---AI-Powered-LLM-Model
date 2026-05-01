// src/components/chat/SourceCards.tsx
"use client";

import { useState } from "react";
import { ExternalLink, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import type { Source } from "@/types";

export function SourceCards({ sources }: { sources: Source[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sources : sources.slice(0, 3);

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Globe className="h-3.5 w-3.5" />
        {sources.length} {sources.length === 1 ? "source" : "sources"}
      </p>

      <div className="flex flex-wrap gap-2">
        {visible.map((src, i) => (
          <SourceChip key={i} source={src} index={i + 1} />
        ))}
      </div>

      {sources.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> {sources.length - 3} more sources
            </>
          )}
        </button>
      )}
    </div>
  );
}

function SourceChip({ source, index }: { source: Source; index: number }) {
  const [hover, setHover] = useState(false);
  const hostname = (() => {
    try { return new URL(source.url).hostname.replace("www.", ""); }
    catch { return source.url; }
  })();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs transition-all hover:shadow-sm hover:border-primary/40",
        "max-w-[200px]"
      )}
    >
      {/* Citation number */}
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
        {index}
      </span>

      {/* Favicon */}
      {source.favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.favicon}
          alt=""
          className="h-3.5 w-3.5 shrink-0 rounded-sm"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}

      <span className="truncate text-muted-foreground">{hostname}</span>
      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50" />

      {/* Hover tooltip */}
      {hover && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-64 rounded-lg border bg-popover p-3 shadow-md text-xs">
          <p className="font-medium text-foreground mb-1 line-clamp-2">{source.title}</p>
          <p className="text-muted-foreground line-clamp-3">{source.snippet}</p>
        </div>
      )}
    </a>
  );
}

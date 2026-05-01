// src/components/landing/Hero.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Globe, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_QUERIES = [
  "Explain quantum computing in simple terms",
  "Summarize this research paper...",
  "What are the latest trends in AI?",
  "Analyze this chart image",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-28 text-center">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-blue-500" />
          Powered by Llama 3.3 · Groq · Gemini Vision
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Search smarter with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            AI that understands
          </span>
        </h1>

        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
          Ask anything. Upload documents. Analyze images. Get cited, streamed answers instantly.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/sign-up">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>

        {/* Demo query chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {DEMO_QUERIES.map((q) => (
            <div
              key={q}
              className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm"
            >
              <Sparkles className="h-3 w-3 shrink-0 text-blue-500" />
              {q}
            </div>
          ))}
        </div>

        {/* Capability badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {[
            { icon: Globe, label: "Real-time web search" },
            { icon: FileText, label: "PDF & DOCX Q&A" },
            { icon: ImageIcon, label: "Image understanding" },
            { icon: Sparkles, label: "Streaming responses" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-blue-500" />
              {label}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

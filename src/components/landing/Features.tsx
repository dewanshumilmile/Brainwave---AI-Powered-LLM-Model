// src/components/landing/Features.tsx
"use client";

import { motion } from "framer-motion";
import {
  Globe, FileText, ImageIcon, Zap, Shield, Moon,
  MessageSquare, Code2, History,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Real-time Web Search",
    desc: "Searches the web live and provides cited answers with source links — always up to date.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    title: "Document Q&A",
    desc: "Upload PDFs, DOCX, or TXT files and ask questions. AI reads and answers from your documents.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: ImageIcon,
    title: "Image Understanding",
    desc: "Upload charts, screenshots, photos. Ask AI to explain, extract text, or summarize visuals.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    desc: "Ultra-fast token streaming via Groq — answers appear word by word, not all at once.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: MessageSquare,
    title: "Chat Memory",
    desc: "Retains conversation context across multiple turns — no need to repeat yourself.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Code2,
    title: "Markdown + Code",
    desc: "Beautifully rendered markdown, syntax-highlighted code blocks, tables, and LaTeX math.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: History,
    title: "Conversation History",
    desc: "All your chats are saved. Rename, search, and revisit any previous conversation.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: Moon,
    title: "Dark / Light Mode",
    desc: "Polished theme system with system-aware toggle and smooth transitions.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "Clerk-powered authentication with Google OAuth, email verification, and secure sessions. Your data is isolated.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need in one place
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A full-featured AI search assistant — not just a chat box.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 inline-flex rounded-lg p-2.5 ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

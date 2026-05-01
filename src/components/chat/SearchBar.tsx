/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/SearchBar.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Send, Globe, Paperclip, X, Loader2, ImageIcon,
  FileText, Mic, MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUploader } from "./FileUploader";
import { PromptTemplates } from "./PromptTemplates";
import type { UploadedFile } from "@/types";

interface Props {
  onSend: (message: string, useWebSearch: boolean) => void;
  disabled?: boolean;
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: UploadedFile) => void;
  onFileClear: () => void;
}

export function SearchBar({
  onSend,
  disabled,
  uploadedFile,
  onFileUpload,
  onFileClear,
}: Props) {
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Voice Input ──────────────────────────────────────────────────────────
  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input not supported. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      toast.info("Listening... Speak now");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice input failed. Try again.");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 200) + "px";
      }
      toast.success(`Voice captured: "${transcript}"`);
    };

    recognition.start();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  function handleSend() {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg, webSearch);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  const FileIcon = uploadedFile?.type === "image" ? ImageIcon : FileText;

  return (
    <div className="relative">
      <PromptTemplates
        onSelect={(prompt) => {
          setInput(prompt);
          textareaRef.current?.focus();
        }}
      />

      {showUploader && (
        <div className="mb-3">
          <FileUploader
            onUpload={(file) => {
              onFileUpload(file);
              setShowUploader(false);
            }}
            onClose={() => setShowUploader(false)}
          />
        </div>
      )}

      {uploadedFile && (
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs">
            <FileIcon className="h-3.5 w-3.5 text-blue-500" />
            <span className="max-w-[200px] truncate">{uploadedFile.name}</span>
            <button onClick={onFileClear} className="ml-1 hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {listening && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="inline-block h-2 w-2 rounded-full bg-red-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-red-500">
            Listening... Speak your question
          </span>
          <button onClick={() => setListening(false)} className="ml-auto text-red-500 hover:text-red-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col rounded-2xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={
            listening ? "Listening... speak now 🎤"
            : uploadedFile ? `Ask a question about ${uploadedFile.name}…`
            : "Ask anything…"
          }
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1 flex-wrap">

            <button
              type="button"
              onClick={() => setWebSearch((w) => !w)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
                webSearch
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Globe className={cn("h-3.5 w-3.5", webSearch && "text-blue-500")} />
              Web
            </button>

            <button
              type="button"
              onClick={() => setShowUploader((s) => !s)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
                showUploader || uploadedFile
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Paperclip className="h-3.5 w-3.5" />
              Attach
            </button>

            <button
              type="button"
              onClick={startVoice}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
                listening
                  ? "border-red-500/50 bg-red-500/10 text-red-500 animate-pulse"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {listening ? "Stop" : "Voice"}
            </button>

          </div>

          <Button
            size="icon"
            className="h-8 w-8 rounded-xl shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
          >
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
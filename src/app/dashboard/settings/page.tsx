// src/app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const AI_PREFS_KEY = "brainwave_ai_prefs";

const DEFAULT_PREFS = {
  webSearch: true,
  showCitations: true,
  streaming: true,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(AI_PREFS_KEY);
      if (saved) setPrefs(JSON.parse(saved));
    } catch {}
  }, []);

  function togglePref(key: keyof typeof DEFAULT_PREFS) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem(AI_PREFS_KEY, JSON.stringify(updated));
    toast.success(`${key === "webSearch" ? "Web search" : key === "showCitations" ? "Citations" : "Streaming"} ${updated[key] ? "enabled" : "disabled"}`);
  }

  async function clearAllChats() {
    if (!confirm("Delete ALL conversations? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/conversations/clear", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("All conversations deleted");
      router.push("/dashboard/chat");
    } catch {
      toast.error("Failed to clear conversations");
    }
  }

  if (!mounted) return null;

  const AI_PREFS = [
    { key: "webSearch" as const, label: "Web search by default", desc: "Automatically search the web for every query" },
    { key: "showCitations" as const, label: "Show source citations", desc: "Display source cards below AI answers" },
    { key: "streaming" as const, label: "Streaming responses", desc: "Show answers word by word as they generate" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Customize your Brainwave experience</p>
        </div>

        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Appearance</h2>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-3">Theme</p>
            <div className="flex gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); toast.success(`${label} theme applied`); }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all",
                    theme === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* AI Preferences */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">AI Preferences</h2>
          <div className="rounded-xl border bg-card divide-y">
            {AI_PREFS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => togglePref(key)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    prefs[key] ? "bg-primary" : "bg-muted"
                  )}
                  role="switch"
                  aria-checked={prefs[key]}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200",
                    prefs[key] ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            These preferences are saved locally in your browser.
          </p>
        </section>

        <Separator />

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-destructive mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Danger Zone
          </h2>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clear all conversations</p>
                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete all chat history</p>
              </div>
              <Button variant="destructive" size="sm" onClick={clearAllChats} className="gap-2">
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
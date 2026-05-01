// src/app/dashboard/stats/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare, Brain, User, BarChart2,
  Calendar, Zap, TrendingUp, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  totalWords: number;
  avgMessagesPerChat: number;
  mostActiveDay: string;
  longestChat: number;
  last7Days: { date: string; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      Failed to load stats.
    </div>
  );

  const CARDS = [
    {
      label: "Total Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      suffix: "",
    },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      icon: Hash,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      suffix: "",
    },
    {
      label: "Your Messages",
      value: stats.userMessages,
      icon: User,
      color: "text-green-500",
      bg: "bg-green-500/10",
      suffix: "",
    },
    {
      label: "AI Responses",
      value: stats.aiMessages,
      icon: Brain,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      suffix: "",
    },
    {
      label: "Words Generated",
      value: stats.totalWords.toLocaleString(),
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      suffix: "",
    },
    {
      label: "Avg Messages / Chat",
      value: stats.avgMessagesPerChat,
      icon: TrendingUp,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      suffix: "",
    },
    {
      label: "Longest Conversation",
      value: stats.longestChat,
      icon: BarChart2,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      suffix: " msgs",
    },
    {
      label: "Most Active Day",
      value: stats.mostActiveDay,
      icon: Calendar,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      suffix: "",
    },
  ];

  const maxCount = Math.max(...stats.last7Days.map((d) => d.count), 1);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Usage Stats</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your Brainwave activity at a glance
          </p>
        </div>

        {stats.totalConversations === 0 ? (
          <EmptyStats />
        ) : (
          <>
            {/* Stat cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CARDS.map(({ label, value, icon: Icon, color, bg, suffix }) => (
                <div
                  key={label}
                  className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={cn("inline-flex rounded-lg p-2.5 mb-3", bg)}>
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {value}{suffix}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Last 7 days bar chart */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold text-sm">Conversations — Last 7 Days</h2>
              </div>

              <div className="flex items-end gap-2 h-32">
                {stats.last7Days.map(({ date, count }) => (
                  <div
                    key={date}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-24">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all duration-500",
                          count > 0
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                        style={{
                          height: count > 0
                            ? `${Math.max((count / maxCount) * 100, 12)}%`
                            : "8%",
                        }}
                        title={`${count} conversation${count !== 1 ? "s" : ""}`}
                      />
                    </div>

                    {/* Count label */}
                    <span className="text-xs font-medium text-foreground">
                      {count > 0 ? count : ""}
                    </span>

                    {/* Date label */}
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message ratio bar */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-semibold text-sm mb-4">Message Breakdown</h2>
              {stats.totalMessages > 0 ? (
                <>
                  <div className="flex rounded-full overflow-hidden h-4 mb-3">
                    <div
                      className="bg-green-500 transition-all duration-700"
                      style={{
                        width: `${(stats.userMessages / stats.totalMessages) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-orange-500 transition-all duration-700"
                      style={{
                        width: `${(stats.aiMessages / stats.totalMessages) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
                      You — {stats.userMessages} ({Math.round((stats.userMessages / stats.totalMessages) * 100)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block" />
                      Brainwave — {stats.aiMessages} ({Math.round((stats.aiMessages / stats.totalMessages) * 100)}%)
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-8">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-52 rounded-xl" />
        <div className="skeleton h-28 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyStats() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No data yet</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Start chatting with Brainwave and your usage stats will appear here.
      </p>
    </div>
  );
}
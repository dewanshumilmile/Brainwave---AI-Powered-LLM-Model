// src/app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await db.conversation.findMany({
      where: { clerkUserId: userId },
      include: { messages: true },
      orderBy: { createdAt: "asc" },
    });

    const totalConversations = conversations.length;

    const allMessages = conversations.flatMap((c) => c.messages);
    const totalMessages = allMessages.length;
    const userMessages = allMessages.filter((m) => m.role === "user").length;
    const aiMessages = allMessages.filter((m) => m.role === "assistant").length;

    const totalWords = allMessages.reduce(
      (sum, m) => sum + m.content.split(/\s+/).length,
      0
    );

    const avgMessagesPerChat = totalConversations
      ? Math.round(totalMessages / totalConversations)
      : 0;

    // Most active day of week
    const dayCounts: Record<string, number> = {};
    conversations.forEach((c) => {
      const day = new Date(c.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
      });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Last 7 days activity
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const count = conversations.filter((c) => {
        const cd = new Date(c.createdAt);
        return (
          cd.getDate() === d.getDate() &&
          cd.getMonth() === d.getMonth() &&
          cd.getFullYear() === d.getFullYear()
        );
      }).length;
      last7Days.push({ date: dateStr, count });
    }

    // Longest conversation
    const longestChat = conversations.reduce(
      (max, c) => (c.messages.length > max ? c.messages.length : max),
      0
    );

    return NextResponse.json({
      totalConversations,
      totalMessages,
      userMessages,
      aiMessages,
      totalWords,
      avgMessagesPerChat,
      mostActiveDay,
      last7Days,
      longestChat,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
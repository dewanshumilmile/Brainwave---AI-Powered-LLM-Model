// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { withRetry } from "@/lib/dbRetry";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await withRetry(() =>
      db.conversation.findMany({
        where: { clerkUserId: userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      })
    );

    return NextResponse.json(conversations);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = body?.title || "New Chat";

    const conversation = await withRetry(() =>
      db.conversation.create({
        data: { clerkUserId: userId, title },
      })
    );

    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}

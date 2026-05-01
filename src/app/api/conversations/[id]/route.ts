// src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversation = await db.conversation.findFirst({
      where: { id: params.id, clerkUserId: userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(conversation);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const conv = await db.conversation.findFirst({ where: { id: params.id, clerkUserId: userId } });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.conversation.update({
      where: { id: params.id },
      data: { title: title.slice(0, 100) },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to rename" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conv = await db.conversation.findFirst({ where: { id: params.id, clerkUserId: userId } });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.conversation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatArcjet } from "@/lib/arcjet";
import { streamChatResponse, buildSystemPrompt, type ChatMessage } from "@/lib/groq";
import { webSearch, buildSearchContext } from "@/lib/search";
import { analyzeImage } from "@/lib/gemini";
import { db } from "@/lib/db";
import type { ChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Arcjet protection ────────────────────────────────────────────────
    const decision = await chatArcjet.protect(req, { userId });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          {
            error: "Too many requests. You have used your AI quota for this hour. Please wait before sending more messages.",
          },
          { status: 429 }
        );
      }
      if (decision.reason.isShield()) {
        return NextResponse.json(
          { error: "Request blocked for security reasons." },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Request denied." }, { status: 403 });
    }

    const body: ChatRequest = await req.json();
    const { message, conversationId, fileContext, imageBase64, useWebSearch } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // ── 1. Get or create conversation ─────────────────────────────────────
    let convId = conversationId;
    if (!convId) {
      const conv = await db.conversation.create({
        data: { clerkUserId: userId, title: message.slice(0, 60) },
      });
      convId = conv.id;
    }

    // ── 2. Load conversation history (last 10 messages for context) ────────
    const history = await db.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const chatMessages: ChatMessage[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // ── 3. Web search ──────────────────────────────────────────────────────
    let sources: { title: string; url: string; snippet: string; favicon?: string }[] = [];
    let searchContext = "";
    if (useWebSearch) {
      sources = await webSearch(message);
      searchContext = buildSearchContext(sources);
    }

    // ── 4. Image analysis ──────────────────────────────────────────────────
    let imageAnalysis = "";
    if (imageBase64) {
      const mimeType = imageBase64.startsWith("/9j") ? "image/jpeg" : "image/png";
      imageAnalysis = await analyzeImage(imageBase64, mimeType, message);
    }

    // ── 5. Build full user message with context ────────────────────────────
    let fullUserMessage = message;
    if (fileContext) fullUserMessage += `\n\n${fileContext}`;
    if (searchContext) fullUserMessage += `\n\nWeb search results:\n${searchContext}`;
    if (imageAnalysis) fullUserMessage = `Image analysis: ${imageAnalysis}\n\nUser question: ${message}`;

    chatMessages.push({ role: "user", content: fullUserMessage });

    const systemPrompt = buildSystemPrompt(useWebSearch || false, !!fileContext);

    // ── 6. Save user message ───────────────────────────────────────────────
    await db.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: message,
        fileContext: fileContext || null,
        imageUrl: imageBase64 ? "uploaded" : null,
      },
    });

    // ── 7. Stream AI response ──────────────────────────────────────────────
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        if (sources.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "sources", sources, conversationId: convId })}\n\n`
            )
          );
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "meta", conversationId: convId })}\n\n`
          )
        );

        try {
          const groqStream = await streamChatResponse(chatMessages, systemPrompt);

          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`)
              );
            }
          }

          await db.message.create({
            data: {
              conversationId: convId!,
              role: "assistant",
              content: fullResponse,
              sources: sources.length > 0 ? sources : undefined,
            },
          });

          if (history.length === 0) {
            await db.conversation.update({
              where: { id: convId! },
              data: { title: message.slice(0, 60) },
            });
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "AI response failed" })}\n\n`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

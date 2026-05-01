// src/app/api/followup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { groq } from "@/lib/groq";
import { apiArcjet } from "@/lib/arcjet";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const decision = await apiArcjet.protect(req);
    if (decision.isDenied()) {
    return NextResponse.json({ questions: [] });
}
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ questions: [] });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Based on the AI response provided, generate exactly 3 short, curious follow-up questions a user might want to ask next.

Rules:
- Return ONLY a valid JSON array of exactly 3 strings
- Each question must be under 12 words
- Make them specific to the content, not generic
- No numbering, no bullet points, no explanation
- Example output: ["What are the main benefits?","How does this compare to X?","Can you show a code example?"]`,
        },
        {
          role: "user",
          content: content.slice(0, 1500),
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "[]";

    // Safely extract JSON array
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ questions: [] });

    const questions: string[] = JSON.parse(match[0]);

    return NextResponse.json({
      questions: questions.slice(0, 3).filter((q) => typeof q === "string"),
    });
  } catch (err) {
    console.error("Follow-up API error:", err);
    return NextResponse.json({ questions: [] });
  }
}
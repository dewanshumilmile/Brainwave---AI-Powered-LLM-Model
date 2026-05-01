// src/lib/groq.ts
import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.3-70b-versatile"; // Fast + free

export function buildSystemPrompt(hasWebSearch: boolean, hasFile: boolean): string {
  let prompt = `You are Brainwave, an intelligent AI search assistant similar to Perplexity AI.
Your job is to provide accurate, well-structured, and helpful answers.

Guidelines:
- Answer in a clear, structured format using markdown
- Use headers, bullet points, and code blocks where appropriate
- Be concise but comprehensive
- Cite sources when you have them using [1], [2] notation
- If you're unsure, say so honestly`;

  if (hasWebSearch) {
    prompt += `\n- You have been provided real-time web search results. Use them to give accurate, up-to-date answers.`;
  }

  if (hasFile) {
    prompt += `\n- The user has uploaded a document. Answer questions based on the document content provided.`;
  }

  return prompt;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function streamChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<AsyncIterable<Groq.Chat.ChatCompletionChunk>> {
  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: 2048,
    temperature: 0.7,
    stream: true,
  });

  return stream;
}

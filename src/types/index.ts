// src/types/index.ts

export interface Source {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  fileContext?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  fileContext?: string;
  imageBase64?: string;
  useWebSearch?: boolean;
}

export interface ChatStreamChunk {
  type: "text" | "sources" | "done" | "error";
  content?: string;
  sources?: Source[];
  conversationId?: string;
  error?: string;
}

export interface UploadedFile {
  name: string;
  type: "pdf" | "docx" | "txt" | "image";
  extractedText?: string;
  base64?: string;
  mimeType?: string;
}

// src/lib/fileParser.ts

/**
 * Parse uploaded files and extract plain text.
 * Handles: PDF, DOCX, TXT
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  // ---- Plain text ----
  if (mimeType === "text/plain" || ext === "txt") {
    return buffer.toString("utf-8").slice(0, 30000);
  }

  // ---- PDF ----
  if (mimeType === "application/pdf" || ext === "pdf") {
    try {
      // Dynamic import so server bundle stays clean
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text.slice(0, 30000);
    } catch (err) {
      console.error("PDF parse error:", err);
      throw new Error("Failed to parse PDF. Make sure it is not password-protected.");
    }
  }

  // ---- DOCX ----
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value.slice(0, 30000);
    } catch (err) {
      console.error("DOCX parse error:", err);
      throw new Error("Failed to parse DOCX file.");
    }
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}

/** Chunk long text into pieces that fit within LLM context */
export function chunkText(text: string, maxChars = 8000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

/** Build a prompt section from file text */
export function buildFileContext(text: string, filename: string): string {
  return `--- START OF DOCUMENT: ${filename} ---\n${text.slice(0, 12000)}\n--- END OF DOCUMENT ---`;
}

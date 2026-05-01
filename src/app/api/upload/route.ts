// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseFile, buildFileContext } from "@/lib/fileParser";
import { uploadArcjet } from "@/lib/arcjet";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Arcjet protection ────────────────────────────────────────────────
    const decision = await uploadArcjet.protect(req, { userId });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          {
            error: "Too many requests. You have used your upload quota for this hour. Please wait before uploading more files.",
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type.startsWith("image/")) {
      const base64 = buffer.toString("base64");
      return NextResponse.json({ type: "image", name: file.name, mimeType: file.type, base64 });
    }

    const extractedText = await parseFile(buffer, file.type, file.name);
    const fileContext = buildFileContext(extractedText, file.name);

    return NextResponse.json({
      type: "document",
      name: file.name,
      mimeType: file.type,
      extractedText: extractedText.slice(0, 500),
      fileContext,
      charCount: extractedText.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

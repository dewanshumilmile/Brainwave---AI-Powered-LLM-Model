// src/components/chat/FileUploader.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/types";

interface Props {
  onUpload: (file: UploadedFile) => void;
  onClose: () => void;
}

export function FileUploader({ onUpload, onClose }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const ALLOWED = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }
      if (!ALLOWED.includes(file.type)) {
        toast.error("Unsupported type. Use PDF, DOCX, TXT, JPG, PNG, or WebP.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        if (data.type === "image") {
          onUpload({ name: file.name, type: "image", base64: data.base64, mimeType: file.type });
        } else {
          const ext = file.name.split(".").pop()?.toLowerCase();
          onUpload({
            name: file.name,
            type: ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : "txt",
            extractedText: data.fileContext,
          });
        }
        toast.success(`${file.name} ready`);
      } catch (err: unknown) {
        toast.error((err as Error).message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Upload a file</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors select-none",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileInput}
        />

        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Processing…</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              {dragging ? "Drop it here!" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, JPG, PNG, WebP · max 10MB</p>
          </>
        )}
      </div>

      {/* Type badges */}
      <div className="mt-3 flex gap-3 flex-wrap">
        {[
          { icon: FileText, label: "PDF / DOCX", color: "text-red-500" },
          { icon: FileText, label: "TXT",        color: "text-green-500" },
          { icon: ImageIcon, label: "Image",     color: "text-violet-500" },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon className={cn("h-3.5 w-3.5", color)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

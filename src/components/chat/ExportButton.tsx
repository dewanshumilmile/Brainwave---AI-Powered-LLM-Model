// src/components/chat/ExportButton.tsx
"use client";

import { useState } from "react";
import { Download, FileText, File, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface Props {
  messages: Message[];
  title?: string;
}

export function ExportButton({ messages, title = "Brainwave Chat" }: Props) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  function exportMarkdown() {
    if (!messages.length) {
      toast.error("No messages to export");
      return;
    }

    const lines: string[] = [
      `# ${title}`,
      ``,
      `> Exported from Brainwave — ${new Date().toLocaleString()}`,
      ``,
      `---`,
      ``,
    ];

    messages.forEach((m) => {
      const role = m.role === "user" ? "### 🧑 You" : "### 🤖 Brainwave";
      lines.push(role);
      lines.push(``);
      lines.push(m.content);
      lines.push(``);

      if (m.sources && m.sources.length > 0) {
        lines.push(`**Sources:**`);
        m.sources.forEach((s, i) => {
          lines.push(`${i + 1}. [${s.title}](${s.url})`);
        });
        lines.push(``);
      }

      lines.push(`---`);
      lines.push(``);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brainwave-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown ✓");
    setOpen(false);
  }

  async function exportPDF() {
    if (!messages.length) {
      toast.error("No messages to export");
      return;
    }

    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      function checkPageBreak(needed = 10) {
        if (y + needed > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }
      }

      // ── Header ─────────────────────────────────────────────────────────
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, pageWidth, 18, "F");
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("⚡ Brainwave", margin, 12);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      doc.text(`Exported: ${new Date().toLocaleString()}`, pageWidth - margin, 12, { align: "right" });

      y = 30;

      // ── Title ──────────────────────────────────────────────────────────
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(title, margin, y);
      y += 8;

      // ── Divider ────────────────────────────────────────────────────────
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // ── Messages ───────────────────────────────────────────────────────
      messages.forEach((m, index) => {
        const isUser = m.role === "user";

        checkPageBreak(16);

        // Role badge background
        if (isUser) {
          doc.setFillColor(239, 246, 255); // light blue
        } else {
          doc.setFillColor(245, 243, 255); // light purple
        }
        doc.roundedRect(margin, y - 4, maxWidth, 8, 2, 2, "F");

        // Role label
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(isUser ? 30 : 80, isUser ? 64 : 30, isUser ? 175 : 175);
        doc.text(isUser ? "YOU" : "BRAINWAVE", margin + 3, y + 1);

        // Message number
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`#${index + 1}`, pageWidth - margin - 3, y + 1, { align: "right" });

        y += 10;
        checkPageBreak(6);

        // Message content
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        // Clean markdown symbols for PDF
        const cleanContent = m.content
          .replace(/#{1,6}\s/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`{3}[\s\S]*?`{3}/g, "[code block]")
          .replace(/`(.*?)`/g, "$1")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .trim();

        const contentLines = doc.splitTextToSize(cleanContent, maxWidth - 4);
        contentLines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, margin + 2, y);
          y += 5;
        });

        // Sources
        if (m.sources && m.sources.length > 0) {
          y += 2;
          checkPageBreak(8);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 100, 100);
          doc.text("Sources:", margin + 2, y);
          y += 4;

          m.sources.slice(0, 3).forEach((s, i) => {
            checkPageBreak(5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(59, 130, 246);
            const sourceText = `${i + 1}. ${s.title || s.url}`;
            const sourceLines = doc.splitTextToSize(sourceText, maxWidth - 8);
            sourceLines.forEach((sl: string) => {
              doc.text(sl, margin + 4, y);
              y += 4;
            });
          });
        }

        y += 4;
        checkPageBreak(4);

        // Separator between messages
        doc.setDrawColor(235, 235, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      });

      // ── Footer on each page ────────────────────────────────────────────
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(
          `Brainwave AI — Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      doc.save(`brainwave-${Date.now()}.pdf`);
      toast.success("Exported as PDF ✓");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed. Try Markdown instead.");
    } finally {
      setExporting(false);
    }
  }

  if (messages.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
          open
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent"
        )}
        title="Export conversation"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border bg-popover shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Export as
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Markdown option */}
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Markdown</p>
                <p className="text-xs text-muted-foreground">.md file</p>
              </div>
            </button>

            {/* PDF option */}
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <File className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">
                  {exporting ? "Generating..." : "PDF"}
                </p>
                <p className="text-xs text-muted-foreground">.pdf file</p>
              </div>
            </button>

            <div className="px-4 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {messages.length} message{messages.length !== 1 ? "s" : ""} will be exported
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
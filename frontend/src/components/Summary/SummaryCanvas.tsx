"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

type Props = {
  open: boolean;
  onClose: () => void;
  fetchingSummary?: boolean;
  markdown: string | null;
  videoId: string;
};

export default function SummaryCanvas({ open, onClose, videoId, markdown, fetchingSummary }: Props) {
  const canActions = useMemo(() => !!markdown && !fetchingSummary, [markdown, fetchingSummary]);

  // Render HTML from the markdown directly (no typing animation)
  const renderedHTML = useMemo(() => {
    try {
      const html = marked.parse(markdown || "") as string;
      return DOMPurify.sanitize(html);
    } catch {
      return "";
    }
  }, [markdown]);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown || "");
    } catch {}  
  };

  const openInEditor = () => {
    try {
      sessionStorage.setItem("summary:markdown", markdown || "");
    } catch {}
    window.location.href = "/editor";
  };

  const exportPdf = async () => {
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: markdown || "", filename: `summary-${videoId}` })
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${videoId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl mx-4 rounded-xl border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="font-medium">Study Material</div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              disabled={!canActions}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Copy as Markdown"
            >Copy</button>
            <button
              onClick={openInEditor}
              disabled={!canActions}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Open in Editor"
            >Open in Editor</button>
            <button
              onClick={exportPdf}
              disabled={!canActions}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Export to PDF"
            >Export PDF</button>
            <button onClick={onClose} className="text-xs rounded-md border px-2 py-1">Close</button>
          </div>
        </div>
        <div className="max-h-[75vh] overflow-auto p-4">
          {fetchingSummary ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <div className="text-sm text-gray-600">Generating study material...</div>
                <div className="text-xs text-gray-500 mt-2">This may take a few moments</div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
          )}
        </div>
      </div>
    </div>
  );
}

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

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    // Use full markdown rendered to HTML for export
    const finalHtml = (() => {
      try { return DOMPurify.sanitize(marked.parse(markdown || "") as string); } catch { return ""; }
    })();
    w.document.write(`<!doctype html><html><head><meta charset='utf-8'>
      <title>Summary - ${videoId}</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #111827; }
        h1,h2,h3 { margin: 1rem 0 .5rem; }
        p, ul, ol, pre, code { margin: .5rem 0; }
        ul, ol { padding-left: 1.25rem; }
        code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      </style>
    </head><body>
      <div id="content">${finalHtml}</div>
      <script>window.onload = () => { setTimeout(() => window.print(), 150); };</script>
    </body></html>`);
    w.document.close();
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

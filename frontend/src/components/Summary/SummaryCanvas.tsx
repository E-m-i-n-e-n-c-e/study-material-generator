"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

type Props = {
  open: boolean;
  onClose: () => void;
  fetchingSummary?: boolean;
  markdown: string | null;
  videoId: string;
  language?: string;
};

export default function SummaryCanvas({ open, onClose, videoId, markdown, language, fetchingSummary }: Props) {
  const [typed, setTyped] = useState<string>("");
  const typingIndexRef = useRef(0);
  const typingTimerRef = useRef<number | null>(null);

  const canActions = useMemo(() => !!markdown && !fetchingSummary, [markdown, fetchingSummary]);

  // Render HTML from the progressively typed markdown
  const renderedHTML = useMemo(() => {
    try {
      const html = marked.parse(typed) as string;
      return DOMPurify.sanitize(html);
    } catch {
      return "";
    }
  }, [typed]);

  // Typing animation: start as soon as markdown is available (no dependency on canvas visibility)
  useEffect(() => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    // Reset when markdown changes
    if (!markdown) {
      setTyped("");
      return;
    }
    typingIndexRef.current = 0;
    setTyped("");
    const step = () => {
      const i = typingIndexRef.current;
      if (!markdown || i >= markdown.length) return;
      setTyped((prev) => prev + markdown[i]);
      typingIndexRef.current = i + 1;
      typingTimerRef.current = window.setTimeout(step, 3);
    };
    typingTimerRef.current = window.setTimeout(step, 3);
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    };
  }, [markdown]);

  // Note: we intentionally do not depend on `open` here so typing can progress in the background.

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
          <div className="font-medium">AI Summary</div>
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
            <div className="text-sm text-gray-600">Thinking… generating summary…</div>
          ) : (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
          )}
        </div>
      </div>
    </div>
  );
}

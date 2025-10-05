"use client";

import { useMemo, useState } from "react";
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

  const [copying, setCopying] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [copyErr, setCopyErr] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportOk, setExportOk] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);

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
    setCopyErr(null);
    setCopyOk(false);
    setCopying(true);
    try {
      await navigator.clipboard.writeText(markdown || "");
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1500);
    } catch (e) {
      setCopyErr("Failed to copy");
      setTimeout(() => setCopyErr(null), 2500);
    } finally {
      setCopying(false);
    }
  };

  const openInEditor = () => {
    try {
      sessionStorage.setItem("summary:markdown", markdown || "");
      sessionStorage.setItem("summary:videoId", videoId || "");
    } catch {}
    const qp = videoId ? `?v=${encodeURIComponent(videoId)}` : "";
    window.location.href = `/editor${qp}`;
  };

  const exportPdf = async () => {
    setExportErr(null);
    setExportOk(false);
    setExporting(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: markdown || "", filename: `summary-${videoId}` })
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${videoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportOk(true);
      setTimeout(() => setExportOk(false), 1500);
    } catch (e) {
      setExportErr(e instanceof Error ? e.message : "Failed to export PDF");
      setTimeout(() => setExportErr(null), 3000);
    } finally {
      setExporting(false);
    }
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
              disabled={!canActions || copying}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Copy as Markdown"
            >{copying ? "Copying…" : copyOk ? "Copied" : "Copy"}</button>
            {copyErr && <span className="text-[10px] text-red-600">{copyErr}</span>}

            <button
              onClick={openInEditor}
              disabled={!canActions}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Open in Editor"
            >Open in Editor</button>

            <button
              onClick={exportPdf}
              disabled={!canActions || exporting}
              className="text-xs rounded-md border px-2 py-1 disabled:opacity-50"
              title="Export to PDF"
            >{exporting ? "Exporting…" : exportOk ? "Exported" : "Export PDF"}</button>
            {exportErr && <span className="text-[10px] text-red-600">{exportErr}</span>}

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

"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default function EditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("summary:markdown");
      if (saved) setMarkdown(saved);
      const url = new URL(window.location.href);
      const v = url.searchParams.get("v");
      if (v) {
        setVideoId(v);
      } else {
        const savedVid = sessionStorage.getItem("summary:videoId");
        if (savedVid) setVideoId(savedVid);
      }
    } catch {}
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    try { sessionStorage.setItem("summary:markdown", e.target.value); } catch {}
  };

  const renderedHTML = useMemo(() => {
    try { return DOMPurify.sanitize(marked.parse(markdown) as string); } catch { return ""; }
  }, [markdown]);

  const [copying, setCopying] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [copyErr, setCopyErr] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportOk, setExportOk] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);

  const copy = async () => {
    setCopyErr(null);
    setCopyOk(false);
    setCopying(true);
    try { 
      await navigator.clipboard.writeText(markdown); 
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1500);
    } catch (e) { 
      setCopyErr("Failed to copy");
      setTimeout(() => setCopyErr(null), 2500);
    } finally { setCopying(false); }
  };

  const exportPdf = async () => {
    setExportErr(null);
    setExportOk(false);
    setExporting(true);
    try {
      const name = videoId ? `summary-${videoId}` : "editor-notes";
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, filename: name })
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.pdf`;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Study Material Editor</h1>
              <div className="flex gap-2">
                <button onClick={() => setPreview((v) => !v)} className="text-xs rounded-md border px-2 py-1">
                  {preview ? "Switch to Edit" : "Preview"}
                </button>
                <button onClick={copy} disabled={copying} className="text-xs rounded-md border px-2 py-1 disabled:opacity-50">{copying ? "Copying…" : copyOk ? "Copied" : "Copy"}</button>
                {copyErr && <span className="text-[10px] text-red-600 self-center">{copyErr}</span>}
                <button onClick={exportPdf} disabled={exporting} className="text-xs rounded-md border px-2 py-1 disabled:opacity-50">{exporting ? "Exporting…" : exportOk ? "Exported" : "Export PDF"}</button>
                {exportErr && <span className="text-[10px] text-red-600 self-center">{exportErr}</span>}
              </div>
            </div>
            {preview ? (
              <div className="rounded-md border p-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
              </div>
            ) : (
              <textarea
                value={markdown}
                onChange={onChange}
                className="w-full h-[70vh] rounded-md border p-3 font-mono text-sm"
                placeholder="Your study material..."
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

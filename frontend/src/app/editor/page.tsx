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

  const copy = async () => {
    try { await navigator.clipboard.writeText(markdown); } catch {}
  };

  const exportPdf = async () => {
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, filename: videoId ? `summary-${videoId}` : "editor-notes" })
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoId ? `summary-${videoId}` : "editor-notes"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
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
                <button onClick={copy} className="text-xs rounded-md border px-2 py-1">Copy</button>
                <button onClick={exportPdf} className="text-xs rounded-md border px-2 py-1">Export PDF</button>
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

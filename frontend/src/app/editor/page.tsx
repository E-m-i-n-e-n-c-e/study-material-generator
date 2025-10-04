"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default function EditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("summary:markdown");
      if (saved) setMarkdown(saved);
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

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const finalHtml = renderedHTML;
    w.document.write(`<!doctype html><html><head><meta charset='utf-8'>
      <title>Summary Editor</title>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Editor</h1>
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
                placeholder="Your summary..."
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

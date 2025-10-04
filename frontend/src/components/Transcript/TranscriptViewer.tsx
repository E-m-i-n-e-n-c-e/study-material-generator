"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Home/Container";
import SummaryCanvas from "@/components/Summary/SummaryCanvas";

export type TranscriptSegment = {
  text: string;
  offset?: number; // seconds
  duration?: number; // seconds
};

type ApiSuccess = {
  status: number;
  videoId: string;
  transcript: TranscriptSegment[];
};

type Props = {
  videoId?: string;
  url?: string;
};

function formatTime(seconds?: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function TranscriptViewer({ videoId: initialVideoId, url }: Props) {
  const [videoId, setVideoId] = useState<string | undefined>(initialVideoId);
  const [segments, setSegments] = useState<TranscriptSegment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openSummary, setOpenSummary] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [fetchingSummary, setFetchingSummary] = useState(false);
  const [summaryMarkdown, setSummaryMarkdown] = useState<string | null>(null);
  const [showSummaryReady, setShowSummaryReady] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const requestBody = useMemo(() => {
    if (url) return { url };
    if (videoId) return { url: `https://www.youtube.com/watch?v=${videoId}` };
    return null;
  }, [url, videoId]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!requestBody) return;
      setLoading(true);
      setError(null);
      try {
        // First, extract transcript
        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const extractData: Partial<ApiSuccess> & { error?: string } = await extractRes
          .json()
          .catch(() => ({} as unknown as Partial<ApiSuccess> & { error?: string }));
        if (!extractRes.ok) {
          throw new Error(extractData?.error || `Extract request failed (${extractRes.status})`);
        }
        
        if (!ignore) {
          setVideoId(extractData.videoId);
          const sorted = (extractData.transcript || []).slice().sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
          setSegments(sorted);
          setLoading(false); // Show transcript immediately
          
          // Generate study material in the background
          if (extractData.videoId && extractData.transcript) {
            // Mark summarization as in-progress
            setFetchingSummary(true);
            // Don't await this - let it run in background
            fetch("/api/summarize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                videoId: extractData.videoId,
                transcript: extractData.transcript,
                language: "en"
              }),
            })
            .then(summaryRes => summaryRes.json())
            .then((summaryData: { markdown?: string }) => {
              if (!ignore && summaryData?.markdown) {
                setSummaryMarkdown(summaryData.markdown);
                setShowSummaryReady(true);
                setTimeout(() => {
                  setShowSummaryReady(false);
                }, 1000); // Hide after 1 seconds
              }
            })
            .catch((summaryError) => {
              console.error("Failed to generate summary:", summaryError);
            })
            .finally(() => {
              if (!ignore) {
                setFetchingSummary(false);
              }
            });
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load transcript";
        if (!ignore) setError(msg);
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [requestBody]);

  const plainTranscript = useMemo(() => {
    if (!segments || !segments.length) return "";
    return segments
      .map((s: TranscriptSegment) => (s.text || "").trim())
      .filter(Boolean)
      .join("\n");
  }, [segments]);

  const copyTranscript = async () => {
    setCopying(true);
    const text = plainTranscript;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API not available");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        console.error("Failed to copy transcript");
      }
    } finally {
      setCopying(false);
    }
  };

  const embedSrc = useMemo(() => {
    if (!videoId) return undefined;
    const params = new URLSearchParams({ enablejsapi: "1", playsinline: "1" });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

  // Use the JS API via postMessage to seek and play without reloading the iframe
  const seekAndPlay = (seconds: number) => {
    const iframe = iframeRef.current;
    const target = iframe?.contentWindow;
    if (!target) return;
    // Seek to time
    target.postMessage(
      JSON.stringify({ event: "command", func: "seekTo", args: [Math.max(0, Math.floor(seconds)), true] }),
      "*"
    );
    // Play video (allowed due to user gesture on click)
    target.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "*"
    );
  };

  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Transcript</h1>
            <p className="mt-1 text-sm text-gray-600">Interactive transcript with timestamps and inline video.</p>
          </div>
          <div className="flex items-center gap-3">
            {fetchingSummary && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span>Generating study material...</span>
              </div>
            )}
            <button
              onClick={copyTranscript}
              disabled={!segments?.length || loading || copying}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={!segments?.length ? "Load transcript first" : copying ? "Copying..." : "Copy Transcript"}
            >
              {copied ? "Copied" : copying ? "Copying..." : "Copy Transcript"}
            </button>
            <button
              onClick={() => setOpenSummary(true)}
              disabled={!segments?.length || !videoId || loading || fetchingSummary}
              className="inline-flex items-center rounded-md bg-black px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !segments?.length ? "Load transcript first" : 
                fetchingSummary ? "Study material is being generated..." : 
                "View Study Material"
              }
            >
              View Study Material
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-md border bg-white p-6 text-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <div className="text-gray-700 font-medium mb-2">Extracting Transcript</div>
              <div className="text-gray-600 text-xs space-y-1">
                <div>• Extracting transcript from YouTube</div>
                <div>• Normalizing transcript content</div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && videoId && (
          <>
            {showSummaryReady && summaryMarkdown && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Study material ready!</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
                {embedSrc ? (
                  <iframe
                    key={embedSrc}
                    className="h-full w-full"
                    ref={iframeRef}
                    src={embedSrc}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="YouTube video player"
                  />
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Video ID</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{videoId}</code>
                </div>
                <div className="max-h-[60vh] overflow-auto divide-y">
                  {segments?.map((seg, idx) => {
                    const start = seg.offset ?? 0;
                    return (
                      <button
                        key={idx}
                        onClick={() => seekAndPlay(start)}
                        className="w-full text-left py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 rounded bg-gray-900 text-white text-xs font-medium px-2 py-0.5">
                            {formatTime(start)}
                          </span>
                          <span className="text-sm text-gray-800">{seg.text}</span>
                        </div>
                      </button>
                    );
                  })}
                  {!segments?.length && (
                    <div className="text-sm text-gray-500 py-4">No transcript segments.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </Container>
      <SummaryCanvas
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        videoId={videoId || ""}
        markdown={summaryMarkdown}
        fetchingSummary={fetchingSummary}
      />
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Home/Container";

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
  const [startAt, setStartAt] = useState<number>(0);

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
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const data: Partial<ApiSuccess> & { error?: string } = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }
        if (!ignore) {
          setVideoId(data.videoId);
          const sorted = (data.transcript || []).slice().sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
          setSegments(sorted);
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load transcript");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [requestBody]);

  const embedSrc = useMemo(() => {
    if (!videoId) return undefined;
    // Include start param to seek on click
    const start = Math.max(0, Math.floor(startAt));
    const params = new URLSearchParams({ enablejsapi: "1", start: String(start) });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, startAt]);

  return (
    <section className="py-10">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Transcript</h1>
          <p className="mt-1 text-sm text-gray-600">Interactive transcript with timestamps and inline video.</p>
        </div>

        {loading && (
          <div className="rounded-md border bg-white p-4 text-sm">Loading transcript…</div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && videoId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
                {embedSrc ? (
                  <iframe
                    key={embedSrc}
                    className="h-full w-full"
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
                        onClick={() => setStartAt(start)}
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
        )}
      </Container>
    </section>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
};

export default function UrlInputPanel({ open }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const isValid = useMemo(() => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const hostAllowed =
        ["youtube.com", "www.youtube.com", "youtu.be"].includes(u.hostname) ||
        u.hostname.endsWith(".youtube.com");
  
      if (!hostAllowed) return false;
  
      // Ensure it has a video ID
      if (u.hostname === "youtu.be") {
        return Boolean(u.pathname.split("/")[1]);
      }
      if (u.hostname.includes("youtube.com")) {
        return u.searchParams.has("v");
      }
      return false;
    } catch {
      return false;
    }
  }, [url]);
  

  const onSubmit = useCallback(async () => {
    setError(null);
    setMessage(null);
    if (!isValid) {
      setError("Please paste a valid YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        // Handle different error types gracefully
        const errorMessage = data?.error || "Request failed";
        setError(errorMessage);
        return;
      }
      
      // Handle successful response
      if (data?.status === 200 && data?.transcript) {
        // Navigate to transcript page with videoId
        const vid = data.videoId as string;
        if (vid) {
          router.push(`/transcript?v=${encodeURIComponent(vid)}`);
          return;
        }
        // Fallback: show message if no video id is present
        const transcriptCount = data.transcript.length;
        setMessage(`Successfully fetched transcript with ${transcriptCount} segments.`);
      } else {
        setMessage(data?.message || "Request processed successfully.");
      }
    } catch (e) {
      setError("Could not reach backend. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isValid, url]);

  return (
    <section aria-hidden={!open} className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}>
      <div id="get-started" className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-left">
            <h3 className="text-lg font-semibold">Paste YouTube URL</h3>
            <p className="mt-1 text-sm text-gray-600">
              Paste a full YouTube link (e.g., https://www.youtube.com/watch?v=...). Press Enter or click Submit.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
          <div className="mt-3 min-h-[1.25rem] text-sm">
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : message ? (
              <p className="text-green-700">{message}</p>
            ) : null}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <ul className="list-disc pl-5 space-y-1">
              <li>We&apos;ll extract the transcript and generate structured study material.</li>
              <li>Processing includes normalization, topic extraction, and study tips.</li>
              <li>Unsupported videos or missing transcripts will show a helpful error.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}



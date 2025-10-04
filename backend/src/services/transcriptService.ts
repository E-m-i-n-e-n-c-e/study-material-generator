import { Innertube, ClientType } from 'youtubei.js';

/**
 * Transcript segment shape used by most transcript libs:
 * { text: string, offset?: number, duration?: number }
 */
export type TranscriptSegment = {
  text: string;
  offset?: number;   // start time in seconds
  duration?: number; // duration in seconds
};

export type TranscriptResult = {
  success: true;
  transcript: TranscriptSegment[];
  videoId: string;
} | {
  success: false;
  error: string;
  code: 'NO_TRANSCRIPT' | 'FETCH_ERROR' | 'INVALID_VIDEO' | 'LIBRARY_ERROR';
};

// Minimal shapes from youtubei.js transcript payload to have type-safety locally
type YTTranscriptSegment = {
  start_ms: number;
  end_ms: number;
  snippet?: { text?: string };
};

type YTTranscriptPayload = {
  transcript?: {
    content?: {
      body?: {
        initial_segments?: YTTranscriptSegment[];
      }
    }
  }
};

/**
 * Extract video ID from various YouTube URL formats
 */
export function getVideoIdFromUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  console.log("URL is ", url);
  console.log("host is ",host);
  if (host === "youtu.be") {
    // pathname like "/dQw4w9WgXcQ" or "/dQw4w9WgXcQ/..."
    const id = url.pathname.replace(/^\/+/, "").split("/")[0];
    console.log("id is", id);
    return id || null;
  }
  // covers youtube.com, www.youtube.com, m.youtube.com, sub.youtube.com
  if (host.endsWith("youtube.com")) {
    return url.searchParams.get("v");
  }
  return null;
}

/**
 * Fetch transcript for a YouTube video
 * This service can be easily swapped for different transcript libraries
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  try {
    console.log("Fetching transcript for videoId:", videoId);

    const lang = process.env.YT_LANG || 'en';

    // Create Innertube client (use WEB client). Avoid passing unsupported options.
    const yt = await Innertube.create({
      client_type: ClientType.WEB
    });

    // Fetch video info and then transcript
    const info = await yt.getInfo(videoId);

    // Some versions expose info.getTranscript(lang)
    let scriptInfo: YTTranscriptPayload | null = null;
    try {
      if (typeof (info as any).getTranscript === 'function') {
        scriptInfo = await (info as any).getTranscript(lang);
      } else if (typeof (yt as any).getTranscript === 'function') {
        // Fallback: some versions may allow calling on the client directly
        scriptInfo = await (yt as any).getTranscript(videoId, lang);
      }
    } catch (e) {
      console.warn('youtubei.js getTranscript threw, will continue to map if possible:', e);
    }

    // Map initial_segments to TranscriptSegment shape
    const segments: YTTranscriptSegment[] | undefined = scriptInfo?.transcript?.content?.body?.initial_segments;
    let transcript: TranscriptSegment[] | null = null;
    if (Array.isArray(segments)) {
      transcript = segments
        .map((segment: YTTranscriptSegment) => {
          const startMs = Number(segment.start_ms ?? 0);
          const endMs = Number(segment.end_ms ?? startMs);
          const text = String(segment.snippet?.text ?? '').trim();
          return {
            text,
            offset: isNaN(startMs) ? 0 : startMs / 1000,
            duration: isNaN(endMs - startMs) ? undefined : (endMs - startMs) / 1000,
          } as TranscriptSegment;
        })
        .filter((s: TranscriptSegment) => s.text.length > 0);
    }

    // If no transcript found or empty, handle gracefully
    if (!transcript || transcript.length === 0) {
      console.error("No transcript available for this video.");
      return {
        success: false,
        error: "Transcript not available for this video. The video may not have captions enabled or may be private.",
        code: 'NO_TRANSCRIPT'
      };
    }

    return {
      success: true,
      transcript,
      videoId
    };

  } catch (err: any) {
    console.error("Transcript fetch error:", err);

    // Handle specific error scenarios
    if (err?.message?.includes('Video unavailable') || err?.message?.includes('not found')) {
      console.error("Video unavailable:", err.message);
      return {
        success: false,
        error: "Video not found or unavailable. Please check the URL and try again.",
        code: 'INVALID_VIDEO'
      };
    }

    console.error("Unknown error fetching transcript:", err);
    return {
      success: false,
      error: "Failed to fetch transcript from remote provider. Please try again later.",
      code: 'FETCH_ERROR'
    };
  }
}


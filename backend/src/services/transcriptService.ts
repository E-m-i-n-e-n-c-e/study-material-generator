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

    // Dynamic import of the transcript library
    const mod = await import("youtube-transcript").catch((err) => {
      console.error("Error importing youtube-transcript:", err);
      return null;
    });

    if (!mod) {
      console.error("Transcript library not available.");
      return {
        success: false,
        error: "Transcript library not available on server. Install `youtube-transcript`.",
        code: 'LIBRARY_ERROR'
      };
    }

    // Extract the correct transcript fetching function from the library
    const YoutubeTranscript = (mod as any).YoutubeTranscript ?? (mod as any).default ?? mod;

    console.log("Loaded Transcript Library:", YoutubeTranscript);

    // Check if fetchTranscript is available in the library
    let transcript: TranscriptSegment[] | null = null;
    if (typeof YoutubeTranscript?.fetchTranscript === "function") {
      console.log("Attempting to fetch transcript...");
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
      console.log("Transcript fetched successfully:", transcript);
    } else if (typeof (mod as any).fetchTranscript === "function") {
      transcript = await (mod as any).fetchTranscript(videoId);
    } else {
      console.error("Library does not expose a valid fetch function.");
      return {
        success: false,
        error: "Loaded transcript module doesn't expose a fetch function. Check module exports or switch library.",
        code: 'LIBRARY_ERROR'
      };
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


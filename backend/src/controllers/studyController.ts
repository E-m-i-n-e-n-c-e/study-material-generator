import { Request, Response } from "express";
import { getVideoIdFromUrl, fetchTranscript } from "../services/transcriptService";
import { summarizeTranscript } from "../services/summarizeService";
import type { TranscriptSegment } from "../services/transcriptService";

/**
 * Merge adjacent transcript segments if their combined duration is less than maxDuration seconds
 */
function mergeShortSegments(segments: TranscriptSegment[], maxDuration: number): TranscriptSegment[] {
  if (segments.length <= 1) return segments;
  
  const merged: TranscriptSegment[] = [];
  let current = { ...segments[0] };
  
  for (let i = 1; i < segments.length; i++) {
    const next = segments[i];
    const currentDuration = current.duration ?? 0;
    const nextDuration = next.duration ?? 0;
    const combinedDuration = currentDuration + nextDuration;
    
    // If combined duration is less than maxDuration, merge the segments
    if (combinedDuration < maxDuration) {
      current.text += " " + next.text;
      current.duration = combinedDuration;
      // Keep the offset of the first segment
    } else {
      // Push current merged segment and start new one
      merged.push(current);
      current = { ...next };
    }
  }
  
  // Don't forget to add the last segment
  merged.push(current);
  
  return merged;
}

/**
 * Extract transcript from YouTube video
 */
export async function extractTranscript(req: Request, res: Response) {
  try {
    const { url } = req.body as { url?: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url in request body" });
    }

    // Parse and basic host validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const hostname = parsed.hostname.toLowerCase();
    const isYoutubeHost =
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname.endsWith(".youtube.com");
    if (!isYoutubeHost) {
      return res.status(400).json({ error: "URL must be a YouTube link" });
    }

    const videoId = getVideoIdFromUrl(parsed);
    if (!videoId) {
      return res.status(400).json({ error: "YouTube URL must contain a video id" });
    }

    // Use the modular transcript service
    const result = await fetchTranscript(videoId);

    if (!result.success) {
      // Handle different error types with appropriate status codes
      switch (result.code) {
        case 'NO_TRANSCRIPT':
          return res.status(404).json({ error: result.error });
        case 'INVALID_VIDEO':
          return res.status(400).json({ error: result.error });
        case 'LIBRARY_ERROR':
          return res.status(500).json({ error: result.error });
        case 'FETCH_ERROR':
        default:
          return res.status(502).json({ error: result.error });
      }
    }
    
    result.transcript.sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
    
    // Merge adjacent segments with total duration < 5 seconds
    const mergedTranscript = mergeShortSegments(result.transcript, 5);
    
    // Return raw transcript to frontend for testing/display
    return res.json({
      status: 200,
      videoId: result.videoId,
      transcript: mergedTranscript, // array of { text, offset, duration } (merged)
      message: "Transcript fetched successfully.",
    });
  } catch (err) {
    console.error("extractTranscript unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

/**
 * Generate study material from transcript
 */
export async function generateStudyMaterial(req: Request, res: Response) {
  try {
    const { videoId, transcript, language } = req.body as {
      videoId?: string;
      transcript?: TranscriptSegment[];
      language?: string;
    };

    if (!videoId || !Array.isArray(transcript)) {
      return res.status(400).json({ error: "Missing videoId or transcript" });
    }

    const result = await summarizeTranscript({ videoId, transcript, language });
    if (!result.success) {
      return res.status(502).json({ error: result.error });
    }

    return res.json({ 
      status: 200, 
      videoId, 
      markdown: result.markdown,
      message: "Study material generated successfully."
    });
  } catch (e) {
    console.error("generateStudyMaterial error", e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

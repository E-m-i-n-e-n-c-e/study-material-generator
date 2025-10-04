import { Request, Response } from "express";
import { getVideoIdFromUrl, fetchTranscript } from "../services/transcriptService";
import { summarizeTranscript } from "../services/summarizeService";
import type { TranscriptSegment } from "../services/transcriptService";

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
    console.log("Transcript fetched successfully:", result);
    
    // Return raw transcript to frontend for testing/display
    return res.json({
      status: 200,
      videoId: result.videoId,
      transcript: result.transcript, // array of { text, offset, duration } (raw)
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

/**
 * Combined endpoint: Extract transcript and generate study material in one call
 */
export async function extractAndGenerate(req: Request, res: Response) {
  try {
    const { url, language } = req.body as { url?: string; language?: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url in request body" });
    }

    // Parse and validate URL
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

    // Extract transcript
    const transcriptResult = await fetchTranscript(videoId);
    if (!transcriptResult.success) {
      switch (transcriptResult.code) {
        case 'NO_TRANSCRIPT':
          return res.status(404).json({ error: transcriptResult.error });
        case 'INVALID_VIDEO':
          return res.status(400).json({ error: transcriptResult.error });
        case 'LIBRARY_ERROR':
          return res.status(500).json({ error: transcriptResult.error });
        case 'FETCH_ERROR':
        default:
          return res.status(502).json({ error: transcriptResult.error });
      }
    }

    // Sort transcript by offset
    transcriptResult.transcript.sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));

    // Generate study material
    const studyResult = await summarizeTranscript({ 
      videoId, 
      transcript: transcriptResult.transcript, 
      language 
    });
    
    if (!studyResult.success) {
      return res.status(502).json({ error: studyResult.error });
    }

    return res.json({
      status: 200,
      videoId,
      transcript: transcriptResult.transcript,
      studyMaterial: studyResult.markdown,
      message: "Transcript extracted and study material generated successfully."
    });
  } catch (err) {
    console.error("extractAndGenerate unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

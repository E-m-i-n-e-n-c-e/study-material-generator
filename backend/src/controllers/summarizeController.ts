import { Request, Response } from "express";
import type { TranscriptSegment } from "../services/transcriptService";
import { summarizeTranscript } from "../services/summarizeService";

export async function summarizeController(req: Request, res: Response) {
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

    return res.json({ status: 200, videoId, markdown: result.markdown });
  } catch (e) {
    console.error("summarizeController error", e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

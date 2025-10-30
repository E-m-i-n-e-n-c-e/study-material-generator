import type { TranscriptSegment } from "./transcriptService";

export type SummarizeRequest = {
  videoId: string;
  transcript: TranscriptSegment[];
  language?: string; // e.g. 'en'
};

export type SummarizeResult = {
  success: true;
  markdown: string;
} | {
  success: false;
  error: string;
};

const FASTAPI_BASE_URL = process.env.SUMMARIZER_API_URL || "http://127.0.0.1:5000";

function buildPrompt(segments: TranscriptSegment[], language?: string) {
  const transcriptParagraph = segments.map(s => s.text).join(" ");
  return transcriptParagraph;
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function summarizeTranscript(req: SummarizeRequest): Promise<SummarizeResult> {
  try {
    const { transcript, language } = req;
    if (!Array.isArray(transcript) || transcript.length === 0) {
      return { success: false, error: "Transcript is empty." };
    }
    const text = buildPrompt(transcript, language);
    const response = await fetch(`${FASTAPI_BASE_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return { success: false, error: `Summarizer API error: ${response.status} ${errText}` };
    }
    const data = await response.json().catch(() => ({} as any));
    const summary: string = (data && (data.summary || data.result || data.markdown || ""));
    if (!summary) return { success: false, error: "Invalid response from summarizer API." };
    return { success: true, markdown: summary };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to generate summary" };
  }
}

function removeTopLevelMarkdownBlock(md: string): string {
 if (md.startsWith("```markdown\n")) {
  //remove first 12 chars
  md = md.slice(12);
 }
 if (md.endsWith("```\n") ) {
  //remove last 4 chars
  md = md.slice(0, -4);
 }
 if (md.endsWith("```")) {
  //remove last 3 chars
  md = md.slice(0, -3);
 }
 return md;
}
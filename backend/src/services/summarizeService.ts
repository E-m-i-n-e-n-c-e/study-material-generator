import type { TranscriptSegment } from "./transcriptService";
import OpenAI from "openai";

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

const DEFAULT_PROMPT = `You are a helpful assistant. Create a concise, well-structured study summary in Markdown for the given YouTube transcript.\n
- Title\n- TL;DR\n- Key Points (bulleted)\n- Section-wise Summary (with subheadings)\n- Actionable Takeaways\n- Glossary (if relevant)\n\nKeep it clean, readable, and use Markdown syntax only.`;

function buildPrompt(segments: TranscriptSegment[], language?: string) {
  const text = segments.map(s => s.text).join("\n");
  const langHint = language ? `Write the summary in ${language}.` : "";
  return `${DEFAULT_PROMPT}\n\n${langHint}\n\nTranscript:\n${text}`;
}

export async function summarizeTranscript(req: SummarizeRequest): Promise<SummarizeResult> {
  try {
    const { transcript, language } = req;
    if (!Array.isArray(transcript) || transcript.length === 0) {
      return { success: false, error: "Transcript is empty." };
    }

    const apiKey = process.env.OPENROUTER_API_KEY || "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";
    const prompt = buildPrompt(transcript, language);

    if (!apiKey) {
      // Fallback naive summary if no API key available
      const first = transcript.slice(0, 8).map(s => `- ${s.text}`).join("\n");
      const md = `# Summary\n\n> (Demo summary: set OPENROUTER_API_KEY for AI-generated content)\n\n## Key Points\n${first}\n\n## Notes\nThis is a local fallback summary.`;
      return { success: true, markdown: md };
    }

    // Use official OpenAI SDK, configured for OpenRouter endpoint
    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": process.env.APP_NAME || "Study Material Generator",
      },
    });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for summarizing educational content." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const md = completion?.choices?.[0]?.message?.content;
    if (!md) return { success: false, error: "Failed to generate summary." };

    return { success: true, markdown: removeTopLevelMarkdownBlock(md) };
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
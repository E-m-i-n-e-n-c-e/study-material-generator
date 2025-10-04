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

const DEFAULT_PROMPT = `You are an expert educational content creator. Create a comprehensive study material from the given YouTube transcript.

Structure the output as follows:

### **Overview**
[Brief summary – 2–3 sentences about what the video covers]

---

### **Concept 1: [Topic Name]**
**Timestamp:** [MM:SS]

- Main Point 1
- Main Point 2
- Main Point 3

**Why This Matters:** [Explanation of importance and relevance]

---

### **Concept 2: [Topic Name]**
**Timestamp:** [MM:SS]

- Main Point 1
- Main Point 2
- Main Point 3

**Key Takeaway:** [Summary of this concept]

---

[Continue with more concepts as needed]

### **Summary**
[Overall summary of the entire content - 3-4 sentences]

### **Study Tips**
- [Practical tip 1]
- [Practical tip 2]
- [Practical tip 3]

### **Further Exploration**
- [Related topic 1]
- [Related topic 2]
- [Additional resources or concepts to explore]

---

**Instructions:**
1. Divide content into logical sections/topics based on the transcript
2. Add clear topic headings that describe each concept
3. Highlight key concepts and important details
4. Use bullet points for important details
5. Include timestamps for each major concept (format as MM:SS)
6. Provide "Why This Matters" or "Key Takeaway" for each concept
7. Make it study-friendly with clear structure and actionable insights
8. Use only Markdown syntax, no code blocks or special formatting`;

function buildPrompt(segments: TranscriptSegment[], language?: string) {
  // Create transcript with timestamps for better context
  const transcriptWithTimestamps = segments
    .map(s => {
      const timestamp = formatTimestamp(s.offset || 0);
      return `[${timestamp}] ${s.text}`;
    })
    .join("\n");
  
  const langHint = language ? `Write the study material in ${language}.` : "";
  return `${DEFAULT_PROMPT}\n\n${langHint}\n\nTranscript with timestamps:\n${transcriptWithTimestamps}`;
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
  //remove first 3 chars
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
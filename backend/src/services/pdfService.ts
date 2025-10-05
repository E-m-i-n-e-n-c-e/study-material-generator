// md-to-pdf typings: Options is the default export in some setups; use `any` to avoid interop issues
type MdToPdfOptions = {
  document_title?: string;
}

export type PdfResult = {
  success: true;
  buffer: Buffer;
} | {
  success: false;
  error: string;
};

/**
 * Generate a PDF Buffer from a Markdown string using md-to-pdf.
 */
export async function generatePdfFromMarkdown(markdown: string, options?: MdToPdfOptions): Promise<PdfResult> {
  try {
    if (!markdown || typeof markdown !== "string") {
      return { success: false, error: "Markdown content is required" };
    }

    // Dynamically import and normalize default/named export
    const mod: any = await import("md-to-pdf");
    const runMdToPdf: any = mod?.mdToPdf || mod?.default;
    if (typeof runMdToPdf !== "function") {
      return { success: false, error: "md-to-pdf is not available" };
    }

    const result = await runMdToPdf({ content: markdown }, {
      pdf_options: {
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "16mm",
          bottom: "20mm",
          left: "16mm"
        }
      },
      ...options
    });

    let buffer: Buffer | undefined = result?.content;
    if (!buffer) {
      return { success: false, error: "Failed to generate PDF content" };
    }

    // Accept Buffer or Uint8Array and coerce to Buffer for safety
    if (!Buffer.isBuffer(buffer)) {
      try {
        buffer = Buffer.from(buffer);
      } catch {
        return { success: false, error: "Failed to process PDF output buffer" };
      }
    }

    return { success: true, buffer };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to generate PDF" };
  }
}



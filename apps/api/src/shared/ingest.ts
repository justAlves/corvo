import { PDFParse } from "pdf-parse";

export const MAX_CONTENT_BYTES = 120_000;

export function truncate(content: string, limit = MAX_CONTENT_BYTES) {
  if (content.length <= limit) return content;
  return `${content.slice(0, limit)}\n\n[... conteúdo truncado em ${limit} chars]`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!match?.[1]) return null;
  return match[1].trim().slice(0, 200);
}

export async function fetchSiteText(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; CorvoOnboardingBot/1.0; +https://corvo.app)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao buscar ${url}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("text")) {
    throw new Error(`Conteúdo não é HTML/texto (${contentType}).`);
  }
  const html = await res.text();
  const title = extractTitle(html) ?? new URL(url).hostname;
  const text = stripHtml(html);
  if (!text) throw new Error("Não encontrei texto útil na página.");
  return { title, text: truncate(text), rawLength: text.length };
}

export async function extractFileText(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
) {
  const bytes = Buffer.from(buffer);

  if (
    mimeType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  ) {
    const parser = new PDFParse({ data: bytes });
    try {
      const parsed = await parser.getText();
      const text = parsed.text?.trim();
      if (!text) throw new Error("Não consegui extrair texto do PDF.");
      return { text: truncate(text), rawLength: text.length };
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType.startsWith("text/") ||
    /\.(txt|md|csv)$/i.test(fileName)
  ) {
    const text = bytes.toString("utf8").trim();
    if (!text) throw new Error("Arquivo vazio.");
    return { text: truncate(text), rawLength: text.length };
  }

  throw new Error(
    `Tipo de arquivo não suportado (${mimeType || fileName}). Envie PDF, TXT ou MD.`,
  );
}

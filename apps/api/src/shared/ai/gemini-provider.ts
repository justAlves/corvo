import { GoogleGenAI } from "@google/genai";
import type { AIProvider, ChatRequest, ChatResponse } from "./types";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly defaultModel: string;
  private readonly client: GoogleGenAI;

  constructor(params: { apiKey: string; defaultModel?: string }) {
    this.client = new GoogleGenAI({ apiKey: params.apiKey });
    this.defaultModel = params.defaultModel ?? "gemini-2.5-flash";
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

    const response = await this.client.models.generateContent({
      model: this.defaultModel,
      contents,
      config: {
        systemInstruction: req.systemPrompt,
        maxOutputTokens: req.maxOutputTokens ?? 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text ?? "";
    const usage = response.usageMetadata;

    return {
      text,
      model: this.defaultModel,
      provider: this.name,
      usage: usage
        ? {
            inputTokens: usage.promptTokenCount,
            outputTokens: usage.candidatesTokenCount,
            cachedInputTokens: usage.cachedContentTokenCount,
          }
        : undefined,
    };
  }
}

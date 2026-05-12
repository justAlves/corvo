import { env } from "../../config/env";
import { GeminiProvider } from "./gemini-provider";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  switch (env.AI_PROVIDER) {
    case "gemini": {
      if (!env.GEMINI_API_KEY) {
        throw new Error(
          "GEMINI_API_KEY is required when AI_PROVIDER=gemini. Set it in .env.",
        );
      }
      cached = new GeminiProvider({
        apiKey: env.GEMINI_API_KEY,
        defaultModel: env.AI_MODEL,
      });
      return cached;
    }
    default: {
      const exhaustive: never = env.AI_PROVIDER;
      throw new Error(`Unknown AI_PROVIDER: ${String(exhaustive)}`);
    }
  }
}

export type { AIProvider, ChatRequest, ChatResponse, ChatTurn } from "./types";

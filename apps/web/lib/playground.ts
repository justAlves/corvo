import { apiFetch } from "./api";

export interface PlaygroundMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PlaygroundReply {
  reply: string;
  model: string;
  provider: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
  };
}

export function sendPlaygroundMessage(messages: PlaygroundMessage[]) {
  return apiFetch<PlaygroundReply>("/onboarding/playground/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

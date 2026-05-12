export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  systemPrompt: string;
  messages: ChatTurn[];
  maxOutputTokens?: number;
}

export interface ChatResponse {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
  };
  model: string;
  provider: string;
}

export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;
  chat(req: ChatRequest): Promise<ChatResponse>;
}

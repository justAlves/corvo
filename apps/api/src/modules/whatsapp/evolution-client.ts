import { env } from "../../config/env";

const BASE_URL = env.EVOLUTION_API_URL.replace(/\/$/, "");

export type EvolutionState = "open" | "close" | "connecting";

export interface EvolutionCreateInstanceResponse {
  instance: {
    instanceName: string;
    instanceId: string;
    integration: string;
    status: string;
  };
  hash: string | { apikey?: string };
  qrcode?: {
    pairingCode?: string | null;
    code: string;
    base64: string;
    count?: number;
  };
  webhook?: unknown;
}

export interface EvolutionConnectResponse {
  pairingCode?: string | null;
  code?: string;
  base64?: string;
  count?: number;
  instance?: { instanceName: string; state: EvolutionState };
}

export interface EvolutionConnectionStateResponse {
  instance: {
    instanceName: string;
    state: EvolutionState;
  };
}

export interface EvolutionSendTextResponse {
  key?: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
  };
  message?: unknown;
  messageTimestamp?: number | string;
  status?: string;
}

export interface EvolutionFetchedInstance {
  id: string;
  name: string;
  connectionStatus: EvolutionState;
  ownerJid: string | null;
  profileName: string | null;
  profilePicUrl: string | null;
  number: string | null;
}

class EvolutionApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "EvolutionApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  apiKey: string = env.EVOLUTION_API_KEY,
): Promise<T> {
  const start = Date.now();
  const method = init.method ?? "GET";
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  const tookMs = Date.now() - start;
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) || `Evolution API ${res.status} on ${path}`;
    console.error(
      "[evolution] http-error",
      JSON.stringify({
        method,
        path,
        status: res.status,
        tookMs,
        body: typeof body === "string" ? body.slice(0, 500) : body,
      }),
    );
    throw new EvolutionApiError(res.status, body, message);
  }
  if (process.env.EVOLUTION_DEBUG === "1") {
    console.log(
      "[evolution] http-ok",
      JSON.stringify({ method, path, status: res.status, tookMs }),
    );
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export interface EvolutionWebhookConfig {
  url: string;
  events: string[];
  enabled?: boolean;
  byEvents?: boolean;
  base64?: boolean;
  headers?: Record<string, string>;
}

export const evolution = {
  async createInstance(params: {
    instanceName: string;
    integration?: "WHATSAPP-BAILEYS" | "WHATSAPP-BUSINESS";
    qrcode?: boolean;
    rejectCall?: boolean;
    msgCall?: string;
    alwaysOnline?: boolean;
    groupsIgnore?: boolean;
    readMessages?: boolean;
    readStatus?: boolean;
    syncFullHistory?: boolean;
    webhook?: EvolutionWebhookConfig;
  }): Promise<EvolutionCreateInstanceResponse> {
    const { webhook, ...rest } = params;
    return request<EvolutionCreateInstanceResponse>("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
        groupsIgnore: true,
        ...rest,
        ...(webhook
          ? {
              webhook: {
                enabled: true,
                byEvents: false,
                base64: false,
                ...webhook,
              },
            }
          : {}),
      }),
    });
  },

  async setWebhook(
    instanceName: string,
    params: EvolutionWebhookConfig,
    apiKey?: string,
  ) {
    return request(
      `/webhook/set/${encodeURIComponent(instanceName)}`,
      {
        method: "POST",
        body: JSON.stringify({
          webhook: {
            enabled: true,
            byEvents: false,
            base64: false,
            ...params,
          },
        }),
      },
      apiKey,
    );
  },

  async connect(instanceName: string, apiKey?: string): Promise<EvolutionConnectResponse> {
    return request<EvolutionConnectResponse>(
      `/instance/connect/${encodeURIComponent(instanceName)}`,
      { method: "GET" },
      apiKey,
    );
  },

  async connectionState(
    instanceName: string,
    apiKey?: string,
  ): Promise<EvolutionConnectionStateResponse> {
    return request<EvolutionConnectionStateResponse>(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`,
      { method: "GET" },
      apiKey,
    );
  },

  async fetchInstance(
    instanceName: string,
    apiKey?: string,
  ): Promise<EvolutionFetchedInstance | null> {
    const res = await request<EvolutionFetchedInstance[] | EvolutionFetchedInstance>(
      `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`,
      { method: "GET" },
      apiKey,
    );
    if (Array.isArray(res)) return res[0] ?? null;
    return res ?? null;
  },

  async restart(instanceName: string, apiKey?: string) {
    return request(
      `/instance/restart/${encodeURIComponent(instanceName)}`,
      { method: "PUT" },
      apiKey,
    );
  },

  async logout(instanceName: string, apiKey?: string) {
    return request(
      `/instance/logout/${encodeURIComponent(instanceName)}`,
      { method: "DELETE" },
      apiKey,
    );
  },

  async deleteInstance(instanceName: string, apiKey?: string) {
    return request(
      `/instance/delete/${encodeURIComponent(instanceName)}`,
      { method: "DELETE" },
      apiKey,
    );
  },

  async sendText(
    instanceName: string,
    params: { number: string; text: string; delay?: number; quotedId?: string },
    apiKey?: string,
  ): Promise<EvolutionSendTextResponse> {
    const body: Record<string, unknown> = {
      number: params.number,
      text: params.text,
    };
    if (typeof params.delay === "number") body.delay = params.delay;
    if (params.quotedId) {
      body.quoted = { key: { id: params.quotedId } };
    }
    return request<EvolutionSendTextResponse>(
      `/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      apiKey,
    );
  },
};

export { EvolutionApiError };

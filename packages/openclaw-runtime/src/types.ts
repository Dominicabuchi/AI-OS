export type OpenClawCapabilityKind =
  | "inference"
  | "image"
  | "audio"
  | "tts"
  | "video"
  | "web"
  | "embedding"
  | "skill"
  | "plugin"
  | "mcp"
  | "task"
  | "cron"
  | "session"
  | "node"
  | "channel"
  | "gateway"
  | "unknown";

export interface OpenClawCapability {
  id: string;
  name: string;
  kind: OpenClawCapabilityKind;
  description?: string;
  available: boolean;
  enabled?: boolean;
  transports?: string[];
  metadata?: Record<string, unknown>;
}

export interface OpenClawHealth {
  healthy: boolean;
  gatewayReachable: boolean;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export interface OpenClawExecutionRequest {
  capability: string;
  action: string;
  payload?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface OpenClawExecutionResult {
  success: boolean;
  capability: string;
  action: string;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

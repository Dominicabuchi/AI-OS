import type {
  OpenClawExecutionRequest,
  OpenClawExecutionResult,
} from "../types";

export interface OpenClawAgentRequest {
  message: string;
  agentId?: string;
  sessionKey?: string;
  timeoutSeconds?: number;
}

export interface OpenClawAgentResult {
  success: boolean;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class OpenClawGatewayClient {

  private readonly baseUrl =
    process.env.OPENCLAW_GATEWAY_URL ??
    "http://127.0.0.1:18789";

  private readonly token =
    process.env.OPENCLAW_GATEWAY_TOKEN ?? "";

  async health(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/`,
        {
          headers: this.headers(),
        },
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Execute an OpenClaw agent turn.
   *
   * This is intentionally separate from /tools/invoke.
   *
   * Agent execution allows OpenClaw to discover/connect configured
   * MCP servers before attempting to use their tools.
   */
  async executeAgent(
    request: OpenClawAgentRequest,
  ): Promise<OpenClawAgentResult> {

    const agentId =
      request.agentId?.trim() || "main";

    const sessionKey =
      request.sessionKey?.trim() ||
      `agent:${agentId}:main`;

    const timeoutSeconds =
      request.timeoutSeconds ?? 180;

    try {

      const response = await fetch(
        `${this.baseUrl}/tools/invoke`,
        {
          method: "POST",
          headers: {
            ...this.headers(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "agent",
            args: {
              message: request.message,
              agentId,
              sessionKey,
              timeoutSeconds,
            },
          }),
        },
      );

      const body =
        await response.json().catch(() => ({}));

      if (!response.ok) {

        return {
          success: false,
          error:
            body?.error?.message ??
            body?.error ??
            `OpenClaw Gateway returned HTTP ${response.status}`,

          metadata: {
            status: response.status,
            agentId,
            sessionKey,
          },
        };
      }

      return {
        success: body?.ok !== false,
        output:
          body?.result ??
          body?.payload ??
          body,

        metadata: {
          status: response.status,
          agentId,
          sessionKey,
        },
      };

    } catch (error) {

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),

        metadata: {
          agentId,
          sessionKey,
        },
      };
    }
  }

  /**
   * Direct tool invocation.
   *
   * Used only for tools that OpenClaw has already exposed
   * to the current runtime/session.
   */
  async execute(
    request: OpenClawExecutionRequest,
  ): Promise<OpenClawExecutionResult> {

    const tool =
      this.normalizeTool(request);

    if (!tool) {

      return {
        success: false,
        capability: request.capability,
        action: request.action,
        error:
          "No OpenClaw tool specified.",
      };
    }

    try {

      const response = await fetch(
        `${this.baseUrl}/tools/invoke`,
        {
          method: "POST",

          headers: {
            ...this.headers(),
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: tool,
            args: this.extractArgs(request),

            sessionKey:
              typeof request.payload?.sessionKey === "string"
                ? request.payload.sessionKey
                : "agent:main:main",

            agentId:
              typeof request.payload?.agentId === "string"
                ? request.payload.agentId
                : "main",
          }),
        },
      );

      const body =
        await response.json().catch(() => ({}));

      if (!response.ok) {

        return {
          success: false,
          capability: request.capability,
          action: request.action,

          error:
            body?.error?.message ??
            body?.error ??
            `OpenClaw Gateway returned HTTP ${response.status}`,

          metadata: {
            status: response.status,
            tool,
          },
        };
      }

      return {
        success: body?.ok !== false,
        capability: request.capability,
        action: request.action,

        output:
          body?.result ??
          body,

        metadata: {
          status: response.status,
          tool,
        },
      };

    } catch (error) {

      return {
        success: false,
        capability: request.capability,
        action: request.action,

        error:
          error instanceof Error
            ? error.message
            : String(error),

        metadata: {
          tool,
        },
      };
    }
  }

  private normalizeTool(
    request: OpenClawExecutionRequest,
  ): string | null {

    const explicit =
      request.payload?.tool;

    if (
      typeof explicit === "string" &&
      explicit.trim()
    ) {
      return explicit.trim();
    }

    if (
      request.action.startsWith(
        "openclaw.tool.",
      )
    ) {

      return request.action.slice(
        "openclaw.tool.".length,
      );
    }

    return null;
  }

  private extractArgs(
    request: OpenClawExecutionRequest,
  ): Record<string, unknown> {

    const explicit =
      request.payload?.args;

    if (
      explicit &&
      typeof explicit === "object" &&
      !Array.isArray(explicit)
    ) {

      return explicit as Record<string, unknown>;
    }

    const payload = {
      ...(request.payload ?? {}),
    };

    delete payload.tool;
    delete payload.action;
    delete payload.args;
    delete payload.sessionKey;
    delete payload.agentId;

    return payload;
  }

  private headers(): Record<string, string> {

    if (!this.token) {

      return {
        "Content-Type":
          "application/json",
      };
    }

    return {
      Authorization:
        `Bearer ${this.token}`,

      "Content-Type":
        "application/json",
    };
  }
}

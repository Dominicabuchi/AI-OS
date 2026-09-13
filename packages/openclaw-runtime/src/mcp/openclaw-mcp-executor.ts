import { spawn } from "node:child_process";

export interface OpenClawMcpExecutionRequest {
  tool: string;
  args?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface OpenClawMcpExecutionResult {
  success: boolean;
  tool: string;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class OpenClawMcpExecutor {

  async execute(
    request: OpenClawMcpExecutionRequest,
  ): Promise<OpenClawMcpExecutionResult> {

    if (
      !request.tool ||
      !request.tool.trim()
    ) {
      return {
        success: false,
        tool: request.tool,
        error: "MCP tool name is required",
      };
    }

    const agentId =
      typeof request.context?.agentId === "string" &&
      request.context.agentId.trim()
        ? request.context.agentId.trim()
        : "main";

    const sessionKey =
      typeof request.context?.sessionKey === "string" &&
      request.context.sessionKey.trim()
        ? request.context.sessionKey.trim()
        : `agent:${agentId}:main`;

    const args =
      request.args ?? {};

    const message = [
      "Execute the requested MCP tool now.",
      "",
      `MCP TOOL: ${request.tool}`,
      `ARGUMENTS: ${JSON.stringify(args)}`,
      "",
      "Connect/discover the configured MCP server if necessary.",
      "Actually execute the MCP tool.",
      "Do not explain how to execute it.",
      "Return the actual result produced by the MCP tool.",
    ].join("\n");

    try {

      const result =
        await this.runOpenClawAgent({
          agentId,
          sessionKey,
          message,
        });

      if (!result.success) {
        return {
          success: false,
          tool: request.tool,
          error: result.error,
          metadata: {
            agentId,
            sessionKey,
            executionPath: "openclaw-agent-cli",
          },
        };
      }

      return {
        success: true,
        tool: request.tool,
        output: result.output,
        metadata: {
          agentId,
          sessionKey,
          executionPath: "openclaw-agent-cli",
        },
      };

    } catch (error) {

      return {
        success: false,
        tool: request.tool,
        error:
          error instanceof Error
            ? error.message
            : String(error),

        metadata: {
          agentId,
          sessionKey,
          executionPath: "openclaw-agent-cli",
        },
      };
    }
  }

  private runOpenClawAgent(
    request: {
      agentId: string;
      sessionKey: string;
      message: string;
    },
  ): Promise<{
    success: boolean;
    output?: unknown;
    error?: string;
  }> {

    return new Promise((resolve) => {

      const child =
        spawn(
          "openclaw",
          [
            "agent",

            "--agent",
            request.agentId,

            "--session-key",
            request.sessionKey,

            "--message",
            request.message,

            "--json",

            "--timeout",
            "180",
          ],
          {
            cwd: process.cwd(),
            env: process.env,
            stdio: [
              "ignore",
              "pipe",
              "pipe",
            ],
          },
        );

      let stdout = "";
      let stderr = "";

      child.stdout.on(
        "data",
        (chunk) => {
          stdout += chunk.toString();
        },
      );

      child.stderr.on(
        "data",
        (chunk) => {
          stderr += chunk.toString();
        },
      );

      child.on(
        "error",
        (error) => {
          resolve({
            success: false,
            error: error.message,
          });
        },
      );

      child.on(
        "close",
        (code) => {

          if (code !== 0) {

            resolve({
              success: false,
              error:
                stderr.trim() ||
                `openclaw agent exited with code ${code}`,
            });

            return;
          }

          try {

            const parsed =
              JSON.parse(stdout);

            if (
              parsed?.status !== "ok"
            ) {

              resolve({
                success: false,
                error:
                  parsed?.error ??
                  parsed?.result?.error ??
                  `OpenClaw agent failed: ${JSON.stringify(parsed)}`,
              });

              return;
            }

            const payloads =
              parsed?.result?.result?.payloads ??
              parsed?.result?.payloads ??
              [];

            const text =
              payloads
                .map(
                  (item: any) =>
                    item?.text,
                )
                .filter(
                  (item: unknown) =>
                    typeof item === "string",
                )
                .join("\n");

            resolve({
              success: true,
              output:
                text ||
                (parsed?.result?.result ??
                 parsed?.result),
            });

          } catch (error) {

            resolve({
              success: false,
              error:
                `Invalid OpenClaw JSON response: ${
                  error instanceof Error
                    ? error.message
                    : String(error)
                }\n${stdout}`,
            });
          }
        },
      );
    });
  }
}

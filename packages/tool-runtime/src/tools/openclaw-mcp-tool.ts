import {
  OpenClawMcpClient,
  OpenClawMcpRegistry,
  OpenClawMcpExecutor,
} from "@ai-os/openclaw-runtime";

import type { Tool } from "../types/tool";

export class OpenClawMcpTool implements Tool {
  readonly id = "openclaw-mcp";

  readonly name = "OpenClaw MCP";

  readonly description =
    "Dynamic execution bridge for every MCP capability discovered through OpenClaw.";

  private readonly registry =
    new OpenClawMcpRegistry(
      new OpenClawMcpClient(),
    );

  private readonly executor =
    new OpenClawMcpExecutor();

  private initialized = false;

  private readonly actions =
    new Set<string>();

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const servers =
      await this.registry.refresh();

    for (const server of servers) {
      const result =
        await this.registry.probe(server.name);

      const probe =
        Array.isArray(result)
          ? result.find(
              item =>
                item.server === server.name,
            )
          : result;

      for (const tool of probe?.tools ?? []) {
        this.actions.add(tool.name);
        this.actions.add(
          `mcp.${tool.name}`,
        );
        this.actions.add(
          `openclaw.mcp.${tool.name}`,
        );
      }
    }

    this.initialized = true;
  }

  canExecute(action: string): boolean {
    return (
      action.startsWith("mcp.") ||
      action.startsWith("openclaw.mcp.") ||
      this.actions.has(action)
    );
  }

  async execute(
    action: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    await this.initialize();

    let tool =
      typeof payload.tool === "string"
        ? payload.tool
        : action;

    if (tool.startsWith("mcp.")) {
      tool = tool.slice(4);
    }

    if (
      tool.startsWith("openclaw.mcp.")
    ) {
      tool = tool.slice(
        "openclaw.mcp.".length,
      );
    }

    /*
     * Accept OpenClaw's flattened MCP action form:
     *
     *   filesystem_list_allowed_directories
     *
     * and normalize it to the canonical:
     *
     *   filesystem__list_allowed_directories
     */
    if (
      !tool.includes("__") &&
      !tool.startsWith("mcp.") &&
      !tool.startsWith("openclaw.mcp.")
    ) {
      const separator = tool.indexOf("_");

      if (separator > 0) {
        tool =
          tool.slice(0, separator) +
          "__" +
          tool.slice(separator + 1);
      }
    }

    if (!tool.includes("__")) {
      throw new Error(
        `Invalid MCP action: ${action}. Expected server__tool.`,
      );
    }

    const args =
      payload.args &&
      typeof payload.args === "object"
        ? payload.args as Record<string, unknown>
        : Object.fromEntries(
            Object.entries(payload).filter(
              ([key]) =>
                key !== "tool" &&
                key !== "args",
            ),
          );

    return this.executor.execute({
      tool,
      args,
    });
  }
}

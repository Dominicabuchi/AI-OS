import {
  OpenClawCapabilityRegistry,
  OpenClawCliClient,
  OpenClawGatewayClient,
} from "@ai-os/openclaw-runtime";

import type { Tool } from "../types/tool";

export class OpenClawTool implements Tool {
  readonly id = "openclaw";

  readonly name = "OpenClaw";

  readonly description =
    "Universal OpenClaw bridge for native capabilities, Gateway tools, MCP, skills, plugins, sessions, tasks, cron, channels and nodes.";

  private readonly cli =
    new OpenClawCliClient();

  private readonly gateway =
    new OpenClawGatewayClient();

  private readonly registry =
    new OpenClawCapabilityRegistry();

  private initialized = false;

  private async ensureRegistry(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.registry.refresh();
    this.initialized = true;
  }

  canExecute(action: string): boolean {
    return action.startsWith("openclaw.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    await this.ensureRegistry();

    /*
     * Explicit Gateway/MCP tool invocation.
     */
    if (
      action === "openclaw.invoke" ||
      action.startsWith("openclaw.tool.")
    ) {
      return this.gateway.execute({
        capability: "openclaw",
        action,
        payload,
      });
    }

    /*
     * Canonical native OpenClaw capabilities.
     *
     * Examples:
     * openclaw.model.run
     * openclaw.web.search
     * openclaw.image.generate
     * openclaw.audio.transcribe
     * openclaw.embedding.create
     */
    if (this.registry.has(action)) {
      const capability =
        this.registry.get(action);

      if (!capability?.available) {
        return {
          success: false,
          capability: action,
          action,
          error:
            `OpenClaw capability unavailable: ${action}`,
        };
      }

      /*
       * Native inference/media/web/embedding
       * capabilities execute through the OpenClaw CLI.
       */
      if (
        capability.kind === "inference" ||
        capability.kind === "image" ||
        capability.kind === "audio" ||
        capability.kind === "tts" ||
        capability.kind === "video" ||
        capability.kind === "web" ||
        capability.kind === "embedding"
      ) {
        const canonicalId =
          capability.id.replace(
            /^openclaw\./,
            "",
          );

        const result =
          await this.cli.executeCapability(
            canonicalId,
            payload,
          );

        return {
          ...result,
          capability: action,
          action,
        };
      }

      /*
       * Runtime surfaces are currently exposed
       * as discovered capabilities. Their specific
       * mutations should use their native OpenClaw
       * command/RPC adapters rather than being
       * incorrectly sent through /tools/invoke.
       */
      return {
        success: true,
        capability: action,
        action,
        output: capability,
        metadata: {
          operation: "capability-discovery",
        },
      };
    }

    return {
      success: false,
      capability: action,
      action,
      error:
        `Unknown OpenClaw capability: ${action}`,
    };
  }
}

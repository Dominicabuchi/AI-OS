import { OpenClawCliClient } from "../client/openclaw-cli-client";
import type {
  OpenClawCapability,
  OpenClawCapabilityKind,
} from "../types";

const KIND_BY_PREFIX: Record<string, OpenClawCapabilityKind> = {
  "model.": "inference",
  "image.": "image",
  "audio.": "audio",
  "tts.": "tts",
  "video.": "video",
  "web.": "web",
  "embedding.": "embedding",
};

export class OpenClawCapabilityDiscovery {
  constructor(
    private readonly cli = new OpenClawCliClient(),
  ) {}

  async discover(): Promise<OpenClawCapability[]> {
    const capabilities: OpenClawCapability[] = [];

    /*
     * OpenClaw capability list emits one JSON object per line.
     * We deliberately parse only valid JSON capability records so
     * OpenClaw's decorative CLI output cannot corrupt the registry.
     */
    try {
      const output = await this.cli.run(
        ["capability", "list"],
        { timeout: 30_000 },
      );

      for (const line of output.split("\n")) {
        const value = line.trim();

        if (!value.startsWith("{")) continue;

        try {
          const item = JSON.parse(value);

          if (
            typeof item.id !== "string" ||
            typeof item.description !== "string"
          ) {
            continue;
          }

          capabilities.push({
            id: `openclaw.${item.id}`,
            name: item.id,
            kind: this.kindFor(item.id),
            description: item.description,
            available: true,
            enabled: true,
            transports: Array.isArray(item.transports)
              ? item.transports
              : [],
            metadata: {
              canonicalId: item.id,
              source: "openclaw.capability.list",
            },
          });
        } catch {
          // Ignore non-JSON CLI lines.
        }
      }
    } catch {
      // Registry remains usable even when discovery is temporarily unavailable.
    }

    /*
     * Always expose the major OpenClaw runtime surfaces as capabilities.
     * These are separate from canonical inference capabilities.
     */
    const runtimeSurfaces = [
      ["gateway", "gateway", "OpenClaw Gateway runtime"],
      ["agents", "gateway", "OpenClaw agent runtime"],
      ["skills", "skill", "OpenClaw skills"],
      ["plugins", "plugin", "OpenClaw plugins"],
      ["mcp", "mcp", "OpenClaw MCP subsystem"],
      ["tasks", "task", "OpenClaw durable tasks"],
      ["cron", "cron", "OpenClaw cron scheduler"],
      ["sessions", "session", "OpenClaw sessions"],
      ["nodes", "node", "OpenClaw paired nodes"],
      ["channels", "channel", "OpenClaw communication channels"],
    ] as const;

    for (const [id, kind, description] of runtimeSurfaces) {
      const capabilityId = `openclaw.${id}`;

      if (!capabilities.some((x) => x.id === capabilityId)) {
        capabilities.push({
          id: capabilityId,
          name: id,
          kind,
          description,
          available: true,
          enabled: true,
          metadata: {
            source: "openclaw.runtime.surface",
          },
        });
      }
    }

    return capabilities;
  }

  private kindFor(id: string): OpenClawCapabilityKind {
    for (const [prefix, kind] of Object.entries(KIND_BY_PREFIX)) {
      if (id.startsWith(prefix)) {
        return kind;
      }
    }

    return "unknown";
  }
}

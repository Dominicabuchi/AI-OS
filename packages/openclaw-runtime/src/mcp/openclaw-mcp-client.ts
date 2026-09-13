import { OpenClawCliClient } from "../client/openclaw-cli-client";

export interface OpenClawMcpServer {
  name: string;
  transport?: string;
  status?: string;
  config?: Record<string, unknown>;
}

export interface OpenClawMcpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

export interface OpenClawMcpProbeResult {
  server: string;
  tools: OpenClawMcpTool[];
  raw: unknown;
}

export class OpenClawMcpClient {
  constructor(
    private readonly cli = new OpenClawCliClient(),
  ) {}

  async listServers(): Promise<OpenClawMcpServer[]> {
    const output = await this.cli.run(
      ["mcp", "show"],
      { timeout: 30_000 },
    );

    const parsed = this.parseJson(output);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      const source =
        parsed.servers &&
        typeof parsed.servers === "object"
          ? parsed.servers
          : parsed;

      return Object.entries(source)
        .filter(([name]) => name !== "raw")
        .map(([name, config]) => ({
          name,
          transport: "stdio",
          status: "configured",
          config:
            config &&
            typeof config === "object"
              ? config as Record<string, unknown>
              : {},
        }));
    }

    return [];
  }

  async probe(
    server?: string,
  ): Promise<
    OpenClawMcpProbeResult |
    OpenClawMcpProbeResult[]
  > {
    const args = ["mcp", "probe", "--json"];

    if (server) {
      args.push(server);
    }

    const output = await this.cli.run(
      args,
      { timeout: 60_000 },
    );

    const parsed = this.parseJson(output);

    /*
     * OpenClaw 2026.6.11 returns:
     *
     * {
     *   generatedAt: "...",
     *   servers: {...},
     *   tools: [
     *     "filesystem__read_file",
     *     ...
     *   ],
     *   diagnostics: []
     * }
     */

    const tools = this.extractToolNames(parsed);

    if (server) {
      return {
        server,
        tools,
        raw: parsed,
      };
    }

    const serverNames =
      parsed?.servers &&
      typeof parsed.servers === "object"
        ? Object.keys(parsed.servers)
        : [];

    if (serverNames.length) {
      return serverNames.map((name) => ({
        server: name,
        tools: tools.filter(
          (tool) =>
            tool.name.startsWith(
              `${name}__`,
            ),
        ),
        raw: parsed,
      }));
    }

    return {
      server: "unknown",
      tools,
      raw: parsed,
    };
  }

  async tools(
    server: string,
    options: {
      include?: string[];
      exclude?: string[];
      clear?: boolean;
    } = {},
  ): Promise<string> {
    const args = ["mcp", "tools", server];

    if (options.clear) {
      args.push("--clear");
    }

    if (options.include?.length) {
      args.push(
        "--include",
        options.include.join(","),
      );
    }

    if (options.exclude?.length) {
      args.push(
        "--exclude",
        options.exclude.join(","),
      );
    }

    return this.cli.run(
      args,
      { timeout: 30_000 },
    );
  }

  private extractToolNames(
    value: any,
  ): OpenClawMcpTool[] {
    const tools =
      value?.tools ??
      value?.result?.tools ??
      [];

    if (!Array.isArray(tools)) {
      return [];
    }

    return tools
      .filter(
        (tool): tool is string =>
          typeof tool === "string" &&
          tool.trim().length > 0,
      )
      .map((name) => ({
        name,
      }));
  }

  private parseJson(
    output: string,
  ): any {
    const text = output.trim();

    try {
      return JSON.parse(text);
    } catch {}

    const firstObject =
      text.indexOf("{");

    const lastObject =
      text.lastIndexOf("}");

    if (
      firstObject >= 0 &&
      lastObject > firstObject
    ) {
      try {
        return JSON.parse(
          text.slice(
            firstObject,
            lastObject + 1,
          ),
        );
      } catch {}
    }

    return {};
  }
}

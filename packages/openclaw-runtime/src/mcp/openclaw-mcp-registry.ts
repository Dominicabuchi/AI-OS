import {
  OpenClawMcpClient,
  OpenClawMcpServer,
  OpenClawMcpProbeResult,
} from "./openclaw-mcp-client";

export class OpenClawMcpRegistry {
  private servers = new Map<string, OpenClawMcpServer>();
  private probes = new Map<string, OpenClawMcpProbeResult>();

  constructor(
    private readonly client = new OpenClawMcpClient(),
  ) {}

  async refresh(): Promise<OpenClawMcpServer[]> {
    const servers = await this.client.listServers();

    this.servers.clear();

    for (const server of servers) {
      if (server?.name) {
        this.servers.set(server.name, server);
      }
    }

    return this.allServers();
  }

  async probe(
    server?: string,
  ): Promise<OpenClawMcpProbeResult | OpenClawMcpProbeResult[]> {
    const result = await this.client.probe(server);

    if (Array.isArray(result)) {
      for (const item of result) {
        this.probes.set(item.server, item);
      }
    } else if (result.server !== "unknown") {
      this.probes.set(result.server, result);
    }

    return result;
  }

  getServer(
    name: string,
  ): OpenClawMcpServer | undefined {
    return this.servers.get(name);
  }

  getProbe(
    name: string,
  ): OpenClawMcpProbeResult | undefined {
    return this.probes.get(name);
  }

  allServers(): OpenClawMcpServer[] {
    return [...this.servers.values()];
  }

  allProbes(): OpenClawMcpProbeResult[] {
    return [...this.probes.values()];
  }
}

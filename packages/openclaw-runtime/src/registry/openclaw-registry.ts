import { OpenClawCapabilityDiscovery } from "../discovery/openclaw-discovery";
import type { OpenClawCapability } from "../types";

export class OpenClawCapabilityRegistry {
  private capabilities =
    new Map<string, OpenClawCapability>();

  constructor(
    private readonly discovery =
      new OpenClawCapabilityDiscovery(),
  ) {}

  async refresh(): Promise<OpenClawCapability[]> {
    const discovered =
      await this.discovery.discover();

    this.capabilities.clear();

    for (const capability of discovered) {
      this.capabilities.set(
        capability.id,
        capability,
      );
    }

    return this.all();
  }

  has(id: string): boolean {
    return this.capabilities.has(id);
  }

  get(id: string):
    OpenClawCapability | undefined {
    return this.capabilities.get(id);
  }

  all(): OpenClawCapability[] {
    return [...this.capabilities.values()];
  }

  findByAction(action: string):
    OpenClawCapability | undefined {
    return this.capabilities.get(action);
  }
}

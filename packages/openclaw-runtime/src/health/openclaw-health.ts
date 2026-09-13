import { OpenClawCliClient } from "../client/openclaw-cli-client";
import { OpenClawGatewayClient } from "../client/openclaw-gateway-client";
import type { OpenClawHealth } from "../types";

export class OpenClawHealthService {
  constructor(
    private readonly cli = new OpenClawCliClient(),
    private readonly gateway = new OpenClawGatewayClient(),
  ) {}

  async check(): Promise<OpenClawHealth> {
    const checkedAt = new Date().toISOString();

    let cliHealthy = false;
    let cliOutput = "";

    try {
      cliOutput = await this.cli.status();
      cliHealthy = true;
    } catch {
      cliHealthy = false;
    }

    const gatewayReachable = await this.gateway.health();

    return {
      healthy: cliHealthy || gatewayReachable,
      gatewayReachable,
      checkedAt,
      details: {
        cliHealthy,
        cliOutput,
      },
    };
  }
}

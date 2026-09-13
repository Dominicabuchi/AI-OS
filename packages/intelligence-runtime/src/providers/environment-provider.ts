import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class EnvironmentProvider implements IntelligenceProvider {
  readonly id = "environment";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return {};
  }
}

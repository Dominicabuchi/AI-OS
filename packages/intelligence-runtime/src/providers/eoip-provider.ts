import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class EOIPProvider implements IntelligenceProvider {
  readonly id = "eoip";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return {};
  }
}

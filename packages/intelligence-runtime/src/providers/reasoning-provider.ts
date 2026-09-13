import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class ReasoningProvider implements IntelligenceProvider {
  readonly id = "reasoning";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return [];
  }
}

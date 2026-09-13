import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class SharedProvider implements IntelligenceProvider {
  readonly id = "shared";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return {};
  }
}

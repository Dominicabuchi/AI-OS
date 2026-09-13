import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class BrowserProvider implements IntelligenceProvider {
  readonly id = "browser";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return {};
  }
}

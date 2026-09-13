import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class PreferencesProvider implements IntelligenceProvider {
  readonly id = "preferences";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return {};
  }
}

import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class FilesProvider implements IntelligenceProvider {
  readonly id = "files";

  async collect(_: IntelligenceRequest): Promise<unknown> {
    return [];
  }
}

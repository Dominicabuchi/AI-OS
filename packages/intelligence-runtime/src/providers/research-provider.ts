import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";

export class ResearchProvider implements IntelligenceProvider {
  readonly id = "research";

  async collect(request: IntelligenceRequest): Promise<unknown> {
    return {
      missionId: request.missionId,
      goal: request.goal,
      research: []
    };
  }
}

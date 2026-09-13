import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";
import { getToolForAction } from "@ai-os/tool-runtime";

export class MemoryProvider
  implements IntelligenceProvider {

  readonly id = "memory";

  async collect(
    request: IntelligenceRequest
  ): Promise<unknown> {

    const tool = getToolForAction(
      "memory.context"
    );

    return tool.execute(
      "memory.context",
      {
        missionId: request.missionId,
        agentId: request.agentId,
        query: request.goal
      }
    );

  }

}

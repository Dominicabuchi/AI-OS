import { Tool } from "../types/tool";
import {
  save,
  retrieve,
  retrieveShared,
  retrieveByMission,
  retrieveByAgent,
  search,
  searchShared,
  searchMission
} from "@ai-os/memory-runtime";

import crypto from "crypto";

export class MemoryTool implements Tool {

  readonly id = "memory";

  readonly name = "Memory";

  readonly description = "Memory operations";

  canExecute(action: string): boolean {
    return action.startsWith("memory.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    switch (action) {

      case "memory.context":
        return {
          mission: retrieveByMission(String(payload.missionId)),
          shared: retrieveShared(String(payload.missionId)),
          agent: retrieveByAgent(String(payload.agentId)),
          relevant: retrieve({
            query: String(payload.query ?? "")
          })
        };

      case "memory.save":
        return save({
          id: crypto.randomUUID(),
          missionId: payload.missionId as string | undefined,
          agentId: payload.agentId as string | undefined,
          scope: (payload.scope as "shared" | "private") ?? "shared",
          type: (payload.type as
            | "working"
            | "episodic"
            | "semantic"
            | "long_term"
            | "entity"
            | "relationship") ?? "working",
          content: String(payload.content),
          metadata: payload.metadata as Record<string, unknown> | undefined,
          createdAt: new Date()
        });

      case "memory.retrieve":
        return retrieve({
          query: String(payload.query ?? "")
        });

      case "memory.retrieve.shared":
        return retrieveShared(String(payload.missionId));

      case "memory.retrieve.mission":
        return retrieveByMission(String(payload.missionId));

      case "memory.retrieve.agent":
        return retrieveByAgent(String(payload.agentId));

      case "memory.search":
        return search({
          query: String(payload.query ?? "")
        });

      case "memory.search.shared":
        return searchShared(
          String(payload.missionId),
          String(payload.query ?? "")
        );

      case "memory.search.mission":
        return searchMission(
          String(payload.missionId),
          String(payload.query ?? "")
        );

      default:
        throw new Error(
          `Unsupported memory action: ${action}`
        );

    }

  }

}

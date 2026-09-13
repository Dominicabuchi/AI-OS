import { Memory } from "../types/memory";
import { retrieve } from "../retrieval";

export interface BuildContextOptions {

  query: string;

  missionId?: string;

  agentId?: string;

  limit?: number;

}

export function buildContext(
  options: BuildContextOptions
): Memory[] {

  return retrieve({
    query: options.query,
    missionId: options.missionId,
    agentId: options.agentId,
    limit: options.limit ?? 20
  });

}

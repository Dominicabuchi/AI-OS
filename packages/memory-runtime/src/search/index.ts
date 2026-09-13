import { Memory, MemoryScope, MemoryType } from "../types/memory";
import { retrieve } from "../retrieval";

export interface SearchOptions {

  query: string;

  missionId?: string;

  agentId?: string;

  namespace?: string;

  scope?: MemoryScope;

  types?: MemoryType[];

  tags?: string[];

  limit?: number;

}

export function search(
  options: SearchOptions
): Memory[] {

  return retrieve({
    query: options.query,
    missionId: options.missionId,
    agentId: options.agentId,
    namespace: options.namespace,
    scope: options.scope,
    types: options.types,
    tags: options.tags,
    limit: options.limit
  });

}

export function searchMission(
  missionId: string,
  query: string,
  limit = 25
): Memory[] {

  return search({
    missionId,
    query,
    limit
  });

}

export function searchShared(
  missionId: string,
  query: string,
  limit = 25
): Memory[] {

  return search({
    missionId,
    query,
    scope: "shared",
    limit
  });

}

export function searchAgent(
  agentId: string,
  query: string,
  limit = 25
): Memory[] {

  return search({
    agentId,
    query,
    limit
  });

}

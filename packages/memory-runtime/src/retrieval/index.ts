import { list } from "../store";
import { Memory, MemoryType, MemoryScope } from "../types/memory";

export interface RetrieveOptions {

  query?: string;

  missionId?: string;

  agentId?: string;

  namespace?: string;

  scope?: MemoryScope;

  types?: MemoryType[];

  tags?: string[];

  limit?: number;

}

function scoreMemory(
  memory: Memory,
  options: RetrieveOptions
): number {

  let score = 0;

  if (
    options.query &&
    memory.content
      .toLowerCase()
      .includes(options.query.toLowerCase())
  ) {
    score += 100;
  }

  if (
    options.missionId &&
    memory.missionId === options.missionId
  ) {
    score += 40;
  }

  if (
    options.agentId &&
    memory.agentId === options.agentId
  ) {
    score += 30;
  }

  score += memory.importance ?? 0;

  score += Math.min(
    memory.accessCount ?? 0,
    20
  );

  return score;

}

export function retrieve(
  options: RetrieveOptions = {}
): Memory[] {

  const results = list()
    .filter(memory => {

      if (
        options.scope &&
        memory.scope !== options.scope
      ) {
        return false;
      }

      if (
        options.namespace &&
        memory.namespace !== options.namespace
      ) {
        return false;
      }

      if (
        options.types &&
        !options.types.includes(memory.type)
      ) {
        return false;
      }

      if (
        options.tags &&
        options.tags.length > 0
      ) {

        const tags = memory.tags ?? [];

        if (
          !options.tags.some(tag =>
            tags.includes(tag)
          )
        ) {
          return false;
        }

      }

      return true;

    })
    .sort(
      (a, b) =>
        scoreMemory(b, options) -
        scoreMemory(a, options)
    );

  return results.slice(
    0,
    options.limit ?? 10
  );

}

export function retrieveByMission(
  missionId: string,
  limit = 100
): Memory[] {

  return retrieve({
    missionId,
    limit
  });

}

export function retrieveShared(
  missionId: string,
  limit = 100
): Memory[] {

  return retrieve({
    missionId,
    scope: "shared",
    limit
  });

}

export function retrieveByAgent(
  agentId: string,
  limit = 100
): Memory[] {

  return retrieve({
    agentId,
    limit
  });

}

export function retrieveAgentMission(
  missionId: string,
  agentId: string,
  limit = 100
): Memory[] {

  return retrieve({
    missionId,
    agentId,
    limit
  });

}

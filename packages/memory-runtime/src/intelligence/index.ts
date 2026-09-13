import { Memory } from "../types/memory";

export function consolidate(
  memories: Memory[]
): Memory[] {

  const seen = new Set<string>();

  return memories.filter(memory => {

    const key = memory.content.trim().toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;

  });

}

export function summarize(
  memories: Memory[]
): string {

  return memories
    .map(memory => memory.summary ?? memory.content)
    .join("\n");

}

export function removeExpired(
  memories: Memory[]
): Memory[] {

  const now = Date.now();

  return memories.filter(memory => {

    if (!memory.expiresAt) {
      return true;
    }

    return memory.expiresAt.getTime() > now;

  });

}

export function detectContradictions(
  memories: Memory[]
): Memory[] {

  // Placeholder for future contradiction engine.
  return memories;

}

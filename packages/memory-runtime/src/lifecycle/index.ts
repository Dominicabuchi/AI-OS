import { Memory } from "../types/memory";
import { save } from "../store";

export function touch(
  memory: Memory
): Memory {

  memory.accessCount =
    (memory.accessCount ?? 0) + 1;

  memory.lastAccessedAt =
    new Date();

  return save(memory);

}

export function expire(

  memories: Memory[]

): Memory[] {

  const now =
    Date.now();

  return memories.filter(
    memory => {

      if (!memory.expiresAt) {

        return true;

      }

      return (
        new Date(
          memory.expiresAt
        ).getTime() >
        now
      );

    }
  );

}

export function archive(

  memory: Memory

): Memory {

  return save({

    ...memory,

    metadata: {

      ...memory.metadata,

      archived: true

    }

  });

}

export function revive(

  memory: Memory

): Memory {

  return save({

    ...memory,

    metadata: {

      ...memory.metadata,

      archived: false

    }

  });

}

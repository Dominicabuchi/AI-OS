import fs from "node:fs";
import path from "node:path";

import { Memory } from "../types/memory";

interface SerializedMemory
  extends Omit<
    Memory,
    | "createdAt"
    | "updatedAt"
    | "lastAccessedAt"
    | "expiresAt"
  > {

  createdAt: string;

  updatedAt?: string;

  lastAccessedAt?: string;

  expiresAt?: string;

}

const memories =
  new Map<string, Memory>();

const missionIndex =
  new Map<string, Set<string>>();

const agentIndex =
  new Map<string, Set<string>>();

const namespaceIndex =
  new Map<string, Set<string>>();

const storeFile =
  process.env.AI_OS_MEMORY_STORE ??
  path.join(
    path.resolve(
      process.env.AI_OS_STATE_DIR ?? ".ai-os"
    ),
    "memory",
    "memories.json"
  );

function ensureStore(): void {

  fs.mkdirSync(
    path.dirname(storeFile),
    {
      recursive: true
    }
  );

  if (!fs.existsSync(storeFile)) {

    fs.writeFileSync(
      storeFile,
      "[]\n",
      "utf8"
    );

  }

}

function serialize(
  memory: Memory
): SerializedMemory {

  return {
    ...memory,

    createdAt:
      memory.createdAt.toISOString(),

    updatedAt:
      memory.updatedAt?.toISOString(),

    lastAccessedAt:
      memory.lastAccessedAt?.toISOString(),

    expiresAt:
      memory.expiresAt?.toISOString()
  };

}

function deserialize(
  memory: SerializedMemory
): Memory {

  return {
    ...memory,

    createdAt:
      new Date(
        memory.createdAt
      ),

    updatedAt:
      memory.updatedAt
        ? new Date(
            memory.updatedAt
          )
        : undefined,

    lastAccessedAt:
      memory.lastAccessedAt
        ? new Date(
            memory.lastAccessedAt
          )
        : undefined,

    expiresAt:
      memory.expiresAt
        ? new Date(
            memory.expiresAt
          )
        : undefined
  };

}

function persist(): void {

  ensureStore();

  const records =
    [...memories.values()]
      .map(serialize);

  fs.writeFileSync(
    storeFile,
    JSON.stringify(
      records,
      null,
      2
    ) + "\n",
    "utf8"
  );

}

function addIndex(

  index: Map<
    string,
    Set<string>
  >,

  key: string | undefined,

  id: string

) {

  if (!key) return;

  if (!index.has(key)) {

    index.set(
      key,
      new Set()
    );

  }

  index.get(key)!.add(id);

}

function rebuildIndexes(): void {

  missionIndex.clear();

  agentIndex.clear();

  namespaceIndex.clear();

  for (
    const memory
    of memories.values()
  ) {

    addIndex(
      missionIndex,
      memory.missionId,
      memory.id
    );

    addIndex(
      agentIndex,
      memory.agentId,
      memory.id
    );

    addIndex(
      namespaceIndex,
      memory.namespace,
      memory.id
    );

  }

}

function loadPersisted(): void {

  ensureStore();

  try {

    const parsed =
      JSON.parse(
        fs.readFileSync(
          storeFile,
          "utf8"
        )
      );

    if (!Array.isArray(parsed)) {

      return;

    }

    memories.clear();

    for (
      const raw
      of parsed as SerializedMemory[]
    ) {

      const memory =
        deserialize(raw);

      memories.set(
        memory.id,
        memory
      );

    }

    rebuildIndexes();

  } catch {

    memories.clear();

    rebuildIndexes();

  }

}

loadPersisted();

export function save(

  memory: Memory

): Memory {

  const existing =
    memories.get(
      memory.id
    );

  const record: Memory = {

    ...existing,

    ...memory,

    createdAt:
      existing?.createdAt ??
      memory.createdAt ??
      new Date(),

    updatedAt:
      new Date()

  };

  memories.set(
    record.id,
    record
  );

  rebuildIndexes();

  persist();

  return record;

}

export function get(
  id: string
) {

  return memories.get(id);

}

export function list() {

  return [
    ...memories.values()
  ];

}

export function remove(
  id: string
) {

  const removed =
    memories.delete(id);

  if (removed) {

    rebuildIndexes();

    persist();

  }

  return removed;

}

export function clear() {

  memories.clear();

  rebuildIndexes();

  persist();

}

export function listShared() {

  return list().filter(
    memory =>
      memory.scope ===
      "shared"
  );

}

export function listPrivate(

  agentId?: string

) {

  return list().filter(
    memory =>

      memory.scope ===
        "private" &&

      (
        !agentId ||
        memory.agentId ===
          agentId
      )
  );

}

export function getMissionMemories(

  missionId: string

): Memory[] {

  return [
    ...(
      missionIndex.get(
        missionId
      ) ?? []
    )
  ]
    .map(
      id =>
        memories.get(id)!
    )
    .filter(Boolean);

}

export function getAgentMemories(

  agentId: string

): Memory[] {

  return [
    ...(
      agentIndex.get(
        agentId
      ) ?? []
    )
  ]
    .map(
      id =>
        memories.get(id)!
    )
    .filter(Boolean);

}

export function getNamespaceMemories(

  namespace: string

): Memory[] {

  return [
    ...(
      namespaceIndex.get(
        namespace
      ) ?? []
    )
  ]
    .map(
      id =>
        memories.get(id)!
    )
    .filter(Boolean);

}

import { Memory } from "../types/memory";

const memories = new Map<string, Memory>();

const missionIndex = new Map<string, Set<string>>();

const agentIndex = new Map<string, Set<string>>();

const namespaceIndex = new Map<string, Set<string>>();

function addIndex(
  index: Map<string, Set<string>>,
  key: string | undefined,
  id: string
) {

  if (!key) return;

  if (!index.has(key)) {
    index.set(key, new Set());
  }

  index.get(key)!.add(id);

}

export function save(
  memory: Memory
): Memory {

  const existing = memories.get(memory.id);

  const record: Memory = {
    ...existing,
    ...memory,
    createdAt:
      existing?.createdAt ??
      memory.createdAt ??
      new Date(),
    updatedAt: new Date()
  };

  memories.set(record.id, record);

  addIndex(
    missionIndex,
    record.missionId,
    record.id
  );

  addIndex(
    agentIndex,
    record.agentId,
    record.id
  );

  addIndex(
    namespaceIndex,
    record.namespace,
    record.id
  );

  return record;

}

export function get(id: string) {
  return memories.get(id);
}

export function list() {
  return [...memories.values()];
}

export function remove(id: string) {
  return memories.delete(id);
}

export function clear() {

  memories.clear();

  missionIndex.clear();

  agentIndex.clear();

  namespaceIndex.clear();

}

export function listShared() {

  return list().filter(
    memory => memory.scope === "shared"
  );

}

export function listPrivate(
  agentId?: string
) {

  return list().filter(memory =>
    memory.scope === "private" &&
    (!agentId ||
      memory.agentId === agentId)
  );

}

export function getMissionMemories(
  missionId: string
): Memory[] {

  return [...(missionIndex.get(missionId) ?? [])]
    .map(id => memories.get(id)!)
    .filter(Boolean);

}

export function getAgentMemories(
  agentId: string
): Memory[] {

  return [...(agentIndex.get(agentId) ?? [])]
    .map(id => memories.get(id)!)
    .filter(Boolean);

}

export function getNamespaceMemories(
  namespace: string
): Memory[] {

  return [...(namespaceIndex.get(namespace) ?? [])]
    .map(id => memories.get(id)!)
    .filter(Boolean);

}

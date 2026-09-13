export type RuntimeEventType =
  | "mission.started"
  | "mission.completed"
  | "mission.failed"
  | "agent.started"
  | "agent.completed"
  | "agent.failed"
  | "iteration.started"
  | "iteration.completed"
  | "model.started"
  | "model.completed"
  | "model.failed"
  | "tool.started"
  | "tool.completed"
  | "tool.failed"
  | "execution.failed";

export interface RuntimeEvent {
  id: string;
  type: RuntimeEventType;
  timestamp: string;
  missionId?: string;
  agentId?: string;
  iteration?: number;
  toolId?: string;
  action?: string;
  durationMs?: number;
  success?: boolean;
  error?: string;
  payload?: Record<string, unknown>;
}

export type RuntimeEventListener = (event: RuntimeEvent) => void;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

class RuntimeEventBus {
  private readonly listeners = new Set<RuntimeEventListener>();
  private readonly history: RuntimeEvent[] = [];
  private readonly maxHistory = 5000;

  emit(
    type: RuntimeEventType,
    data: Omit<RuntimeEvent, "id" | "type" | "timestamp"> = {},
  ): RuntimeEvent {
    const event: RuntimeEvent = {
      id: createId(),
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.history.push(event);

    if (this.history.length > this.maxHistory) {
      this.history.splice(0, this.history.length - this.maxHistory);
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Observability must never break execution.
      }
    }

    return event;
  }

  subscribe(listener: RuntimeEventListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getHistory(limit = 500): RuntimeEvent[] {
    return this.history.slice(-Math.max(0, limit));
  }

  clear(): void {
    this.history.length = 0;
  }
}

export const runtimeEventBus = new RuntimeEventBus();

export function emitRuntimeEvent(
  type: RuntimeEventType,
  data: Omit<RuntimeEvent, "id" | "type" | "timestamp"> = {},
): RuntimeEvent {
  return runtimeEventBus.emit(type, data);
}

export function subscribeRuntimeEvents(
  listener: RuntimeEventListener,
): () => void {
  return runtimeEventBus.subscribe(listener);
}

export function getRuntimeEvents(limit = 500): RuntimeEvent[] {
  return runtimeEventBus.getHistory(limit);
}

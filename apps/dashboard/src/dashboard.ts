export interface DashboardAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  tools: string[];
  runtimeCapabilities: string[];
  agentDependencies: string[];
  composioActions: string[];
}

export interface DashboardJob {
  id: string;
  agentId: string;
  mission: unknown;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
  error?: string;
}

export interface RuntimeEvent {
  id: string;
  type: string;
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

const API =
  (globalThis as any).AI_OS_API_URL ??
  "http://127.0.0.1:3001";

export async function api<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API}${path}`,
    options,
  );

  if (!response.ok) {
    throw new Error(
      `AI-OS API ${response.status}: ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

export function getAgents() {
  return api<DashboardAgent[]>("/agents");
}

export function getJobs() {
  return api<DashboardJob[]>("/jobs");
}

export function getEvents(limit = 500) {
  return api<RuntimeEvent[]>(
    `/events?limit=${limit}`,
  );
}

export function getTools() {
  return api<
    Array<{
      id: string;
      name: string;
      description: string;
    }>
  >("/tools");
}

export async function createMission(
  agentId: string,
  goal: string,
  maxIterations = 25,
) {
  const id =
    `mission-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

  return api<DashboardJob>("/missions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      agentId,
      mission: {
        id,
        goal,
        maxIterations,
      },
    }),
  });
}

export function connectLiveEvents(
  callback: (event: RuntimeEvent) => void,
) {
  const socket = new WebSocket(
    API.replace(/^http/, "ws") +
      "/events/live",
  );

  socket.onmessage = (message) => {
    try {
      callback(
        JSON.parse(message.data),
      );
    } catch {
      // Ignore malformed event frames.
    }
  };

  return socket;
}

export interface Mission {

  id: string;

  name: string;

  goal: string;

  agent: string;

  enabled: boolean;

  policy: "once" | "loop";

  interval?: number;

  maxIterations?: number;

  timeoutMs?: number;

  maxRetries?: number;

  metadata?: Record<string, unknown>;

}

import { Mission } from "@ai-os/shared";

export interface ExecutionRequest {
  agentId: string;
  mission: Mission;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  actionsExecuted: number;
}

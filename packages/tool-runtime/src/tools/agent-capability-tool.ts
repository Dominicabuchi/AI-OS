import { Tool } from "../types/tool";
import {
  getAgent,
} from "@ai-os/agent-runtime";

export class AgentCapabilityTool implements Tool {

  readonly id = "agent-capability";

  readonly name = "Agent Capability";

  readonly description =
    "Internal AI-OS capability for invoking another registered specialist agent.";

  canExecute(action: string): boolean {
    return [
      "research",
      "planning",
      "reasoning",
      "execution",
    ].includes(action);
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    if (action === "execution") {
      return {
        capability: "execution",
        delegated: true,
        payload,
      };
    }

    const agent = getAgent(action);

    if (!agent) {
      throw new Error(
        `Agent capability "${action}" is not registered.`
      );
    }

    const goal =
      typeof payload.goal === "string"
        ? payload.goal
        : typeof payload.mission === "string"
          ? payload.mission
          : JSON.stringify(payload);

    const mission = {
      id:
        typeof payload.id === "string"
          ? payload.id
          : `capability-${action}-${Date.now()}`,
      name:
        typeof payload.name === "string"
          ? payload.name
          : `${action} capability`,
      goal,
      agent: action,
      policy: "once" as const,
      enabled: true,
    };

    return agent.buildPrompt(mission);
  }
}

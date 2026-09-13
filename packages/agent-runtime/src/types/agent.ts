import { Mission } from "@ai-os/shared";

export interface AgentCapabilityContract {
  /**
   * Actual executable runtime tools.
   */
  tools: string[];

  /**
   * Other AI-OS agents this agent may require,
   * delegate to, or depend on.
   */
  agentDependencies: string[];

  /**
   * Composio actions this agent expects to execute
   * when authenticated/configured.
   */
  composioActions: string[];
}

export interface Agent extends AgentCapabilityContract {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly model: string;
  readonly systemPrompt: string;

  buildPrompt(
    mission: Mission
  ): Promise<string>;
}

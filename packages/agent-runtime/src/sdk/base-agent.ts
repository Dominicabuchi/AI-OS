import { Agent } from "../types/agent";
import { Mission } from "@ai-os/shared";

export abstract class BaseAgent implements Agent {

  abstract readonly id: string;

  abstract readonly name: string;

  abstract readonly description: string;

  abstract readonly model: string;

  abstract readonly systemPrompt: string;

  abstract readonly tools: string[];

  /**
   * Other AI-OS agents this agent may depend on,
   * delegate to, or coordinate with.
   */
  readonly agentDependencies: string[] = [];

  /**
   * External Composio actions this agent may use.
   */
  readonly composioActions: string[] = [];

  /**
   * Agents may override these when they have explicit
   * delegation/dependency requirements.
   */

  /**
   * Capabilities every agent receives from the AI-OS runtime.
   */
  readonly runtimeCapabilities: string[] = [
    "tool-execution",
    "memory",
    "recovery",
  ];

  abstract buildPrompt(
    mission: Mission
  ): Promise<string>;

}

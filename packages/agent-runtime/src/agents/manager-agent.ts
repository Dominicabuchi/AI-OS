import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { managerAgentPrompt } from "../prompts/manager-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class ManagerAgent extends BaseAgent {

  readonly id = "manager";

  
  readonly agentDependencies = ['planning', 'reasoning'];

  readonly runtimeCapabilities = [
    "agent-delegation",
    "mission-execution",
    "tool-execution",
    "memory",
    "recovery",
  ];
readonly name = "Manager Agent";

  readonly description =
    "Runtime implementation of the Manager Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    managerAgentPrompt + composioCapabilityContext("manager");

  readonly tools = [
    
    "planning",
    "reasoning",
    "execution",
    "memory",
    "task",
    "communication",
    "composio",
    "browser",
    "search",
    "http",
    "files",
    "terminal",
    "git",
    "github",

];

  async buildPrompt(
    mission: Mission
  ): Promise<string> {

    return `
MISSION

${mission.goal}

AVAILABLE TOOLS

${this.tools.join(", ")}

Return executable JSON only.
`;

  }

}

import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { planningAgentPrompt } from "../prompts/planning-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class PlanningAgent extends BaseAgent {

  readonly id = "planning";

  
  readonly agentDependencies = ['research'];
readonly name = "Planning Agent";

  readonly description =
    "Develops strategic execution plans for missions.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    planningAgentPrompt + composioCapabilityContext("planning");  readonly tools = [
    
    "research",
    "memory",
    "browser",
    "search",
    "files",
    "terminal",
    "task",
    "composio",
    "communication",

];

  async buildPrompt(
    mission: Mission
  ): Promise<string> {

    return `
MISSION

${mission.goal}

AVAILABLE AI-OS TOOLS

${this.tools.join(", ")}

The tools listed above are the authoritative executable AI-OS tools for this mission.

Do not inspect, query, or rely on OpenClaw's native tool catalog to determine tool availability.

When execution is required, emit the appropriate AI-OS actions directly, including files.read and terminal.exec when those tools are listed above.

Develop the highest-quality execution strategy grounded in actual tool results.

Return executable JSON only.
`;

  }

}

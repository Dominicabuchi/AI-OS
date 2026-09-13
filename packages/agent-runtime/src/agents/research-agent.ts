import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { researchAgentPrompt } from "../prompts/research-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class ResearchAgent extends BaseAgent {

  readonly id = "research";

  readonly name = "Research Agent";

  readonly description =
    "World-class autonomous research, intelligence, validation and evidence specialist.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    researchAgentPrompt + composioCapabilityContext("research");  readonly agentDependencies = [];

  readonly runtimeCapabilities = ["tool-execution", "research", "memory"];

  readonly tools = [
    "browser",
    "search",
    "http",
    "files",
    "memory",
    "task",
    "terminal",
    "composio",
    "github",
    "communication",
    "reddit",
];

  async buildPrompt(
    mission: Mission
  ): Promise<string> {

    return `
MISSION

${mission.goal}

AVAILABLE TOOLS

${this.tools.join(", ")}

Conduct exhaustive evidence-based research.

Return executable JSON only.
`;

  }

}

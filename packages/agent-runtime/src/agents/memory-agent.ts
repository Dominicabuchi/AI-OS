import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { memoryAgentPrompt } from "../prompts/memory-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class MemoryAgent extends BaseAgent {

  readonly id = "memory";

  readonly name = "Memory Agent";

  readonly description =
    "Runtime implementation of the Memory Agent.";

  readonly model =
    "qwen/qwen3.8-max-0902";

  readonly systemPrompt =
    memoryAgentPrompt + composioCapabilityContext("memory");  readonly agentDependencies = [];

  readonly runtimeCapabilities = ["tool-execution", "memory"];

  readonly tools = [
    "memory",
    "files",
    "task",
    "browser",
    "search",
    "communication",
    "composio",
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

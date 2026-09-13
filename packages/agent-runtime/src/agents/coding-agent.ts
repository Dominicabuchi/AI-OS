import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { codingAgentPrompt } from "../prompts/coding-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class CodingAgent extends BaseAgent {

  readonly id = "coding";

  readonly name = "Coding Agent";

  readonly description =
    "Runtime implementation of the Coding Agent.";

  readonly model =
    "qwen/qwen3.8-max-0902";

  readonly systemPrompt =
    codingAgentPrompt + composioCapabilityContext("coding");

  readonly agentDependencies = [];

  readonly runtimeCapabilities = ["tool-execution", "code-execution", "memory"];

  readonly tools = [
    "browser",
    "search",
    "files",
    "terminal",
    "git",
    "github",
    "http",
    "memory",
    "task",
    "composio",
    "ci",
    "docker",
    "communication",
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

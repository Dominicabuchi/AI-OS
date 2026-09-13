import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { copywritingAgentPrompt } from "../prompts/copywriting-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class CopywritingAgent extends BaseAgent {

  readonly id = "copywriting";

  
  readonly agentDependencies = ['research'];
readonly name = "Copywriting Agent";

  readonly description =
    "Runtime implementation of the Copywriting Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    copywritingAgentPrompt + composioCapabilityContext("copywriting");

  readonly tools = [
    
    "research",
    "browser",
    "search",
    "files",
    "memory",
    "communication",
    "composio",
    "http",
    "task",
    "linkedin",
    "x",
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

Return executable JSON only.
`;

  }

}

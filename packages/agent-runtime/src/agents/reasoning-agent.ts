import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { reasoningAgentPrompt } from "../prompts/reasoning-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class ReasoningAgent extends BaseAgent {

  readonly id = "reasoning";

  
  readonly agentDependencies = ['research'];
readonly name = "Reasoning Agent";

  readonly description =
    "Runtime implementation of the Reasoning Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    reasoningAgentPrompt + composioCapabilityContext("reasoning");  readonly tools = [
    
    "research",
    "memory",
    "browser",
    "search",
    "files",
    "http",
    "task",
    "terminal",
    "git",
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

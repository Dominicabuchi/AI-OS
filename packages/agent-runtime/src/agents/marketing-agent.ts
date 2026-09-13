import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { marketingAgentPrompt } from "../prompts/marketing-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class MarketingAgent extends BaseAgent {

  readonly id = "marketing";

  
  readonly agentDependencies = ['research'];
readonly name = "Marketing Agent";

  readonly description =
    "Runtime implementation of the Marketing Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    marketingAgentPrompt + composioCapabilityContext("marketing");

  readonly tools = [
    
    "research",
    "browser",
    "search",
    "files",
    "memory",
    "communication",
    "gmail",
    "linkedin",
    "x",
    "reddit",
    "task",
    "composio",
    "http",
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

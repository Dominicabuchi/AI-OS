import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { seoAgentPrompt } from "../prompts/seo-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class SeoAgent extends BaseAgent {

  readonly id = "seo";

  
  readonly agentDependencies = ['research'];
readonly name = "Seo Agent";

  readonly description =
    "Runtime implementation of the Seo Agent.";

  readonly model =
    "qwen/qwen3.8-max-0902";

  readonly systemPrompt =
    seoAgentPrompt + composioCapabilityContext("seo");

  readonly tools = [
    
    "research",
    "browser",
    "search",
    "http",
    "files",
    "memory",
    "terminal",
    "communication",
    "composio",
    "task",
    "git",
    "github",
    "x",

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

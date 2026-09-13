import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { landingPageAgentPrompt } from "../prompts/landing-page-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class LandingPageAgent extends BaseAgent {

  readonly id = "landing-page";

  readonly name = "LandingPage Agent";

  readonly description =
    "Runtime implementation of the LandingPage Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    landingPageAgentPrompt + composioCapabilityContext("landing-page");

  readonly agentDependencies = [];

  readonly runtimeCapabilities = ["tool-execution", "web-development", "memory"];

  readonly tools = [
    "browser",
    "search",
    "http",
    "files",
    "memory",
    "terminal",
    "git",
    "github",
    "communication",
    "composio",
    "task",
];;

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

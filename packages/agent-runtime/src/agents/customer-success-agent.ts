import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { customerSuccessAgentPrompt } from "../prompts/customer-success-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class CustomerSuccessAgent extends BaseAgent {

  readonly id = "customer-success";

  
  readonly agentDependencies = ['research'];
readonly name = "CustomerSuccess Agent";

  readonly description =
    "Runtime implementation of the CustomerSuccess Agent.";

  readonly model =
    "qwen/qwen3-235b-a22b";

  readonly systemPrompt =
    customerSuccessAgentPrompt + composioCapabilityContext("customer-success");

  readonly tools = [
    
    "research",
    "browser",
    "search",
    "files",
    "memory",
    "communication",
    "gmail",
    "linkedin",
    "task",
    "composio",
    "http",

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

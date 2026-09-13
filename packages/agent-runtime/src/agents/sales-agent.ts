import { BaseAgent } from "../sdk/base-agent";

import { Mission } from "@ai-os/shared";

import { salesAgentPrompt } from "../prompts/sales-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";

export class SalesAgent extends BaseAgent {

  readonly id = "sales";

  readonly agentDependencies = ["research"];

  readonly name = "Sales Agent";

  readonly description =
    "Runtime implementation of the Sales Agent.";

  readonly model =
    "qwen/qwen3.8-max-0902";

  readonly systemPrompt =
    salesAgentPrompt +
    composioCapabilityContext("sales");

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
  ];

  async buildPrompt(
    mission: Mission
  ): Promise<string> {
    return `
MISSION

${mission.goal}

EXECUTION CONTRACT

You are an execution agent. Drafting outreach is not mission completion.

For outbound prospecting:

1. Find real current hiring demand using linkedin.jobs and research/search when needed.
2. Identify the correct recruiting, talent, HR, hiring, or relevant decision-maker using linkedin.people and verified profile/company evidence.
3. Never invent employment, hiring demand, relationship status, or common ground.
4. If the prospect is actually a first-degree LinkedIn connection, outreach may state that we are connected on LinkedIn.
5. If the prospect is not connected, never claim an existing LinkedIn connection.
6. Use concise, value-first outreach based on the verified hiring need.
7. Execute outbound through linkedin.send using recipient, company, profileUrl, text, and inviteText.
8. linkedin.send is the canonical production delivery engine. Do not recreate its browser logic, use temporary workers, or bypass its verification.
9. Drafting a message, opening a profile, clicking a button, following someone, reaching an InMail upsell, or any unverified UI action is not success.
10. Mission success requires positively verified delivery from the canonical tool result.
11. If LinkedIn exposes a verified public email fallback, allow the canonical linkedin.send path to execute and verify Gmail delivery.
12. If delivery cannot be positively verified, report failure rather than claiming success.

AVAILABLE TOOLS

${this.tools.join(", ")}

Return executable JSON only.

`;
  }
}

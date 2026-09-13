
import { BaseAgent } from "../sdk/base-agent";
import { Mission } from "@ai-os/shared";
import { communicationAgentPrompt } from "../prompts/communication-agent.prompt";

import { composioCapabilityContext } from "../sdk/composio-capability-context";
export class CommunicationAgent extends BaseAgent {

  readonly id = "communication";

  readonly name =
    "Communication Agent";

  readonly description =
    "World-class autonomous communication, coordination, stakeholder communication and relationship management specialist.";

  readonly model =
    "qwen/qwen3.8-max-0902";

  readonly systemPrompt =
    communicationAgentPrompt + composioCapabilityContext("communication");

  readonly agentDependencies = [];

  readonly runtimeCapabilities = ["tool-execution", "communication", "memory"];

  readonly tools = [
    "communication",
    "gmail",
    "browser",
    "search",
    "linkedin",
    "x",
    "reddit",
    "http",
    "files",
    "memory",
    "task",
    "terminal",
    "composio",
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

============================================================
EXECUTION CONTRACT
============================================================

You are the Communication Agent.

Convert the mission into the smallest reliable sequence
of executable communication actions.

Do not merely describe what should happen.

Return executable JSON only.

============================================================
OUTPUT FORMAT
============================================================

Return exactly one JSON object:

{
  "actions": [
    {
      "action": "tool.action",
      "payload": {}
    }
  ],
  "reasoning": "brief execution rationale",
  "verification": {
    "required": true,
    "criteria": []
  }
}

============================================================
COMMUNICATION ACTIONS
============================================================

Use these action families when appropriate:

GMAIL

gmail.search
gmail.read
gmail.send
gmail.reply
gmail.create_draft
gmail.send_draft
gmail.get_draft
gmail.update_draft
gmail.list_threads
gmail.read_thread
gmail.get_attachment
gmail.search_people

LINKEDIN

linkedin.send
linkedin.search
linkedin.recruiters
linkedin.jobs

X

x.post
x.reply
x.quote
x.repost
x.like
x.unlike
x.search
x.user
x.me
x.timeline

REDDIT

reddit.post
reddit.search
reddit.create_post

HIGH-LEVEL COMMUNICATION

communication.send

============================================================
CHANNEL SELECTION
============================================================

Choose the channel that best satisfies the mission.

Prefer:

- Gmail for email communication.
- LinkedIn for professional outreach and LinkedIn messaging.
- X for X communication and engagement.
- Reddit for Reddit communication.
- communication.send when the mission intentionally abstracts
  the underlying communication channel.

Do not select a channel arbitrarily.

============================================================
GMAIL RULES
============================================================

For Gmail:

- Use gmail.search before reading unknown messages.
- Use gmail.read when a specific message is identified.
- Use gmail.reply for replies to existing threads.
- Use gmail.send for new email.
- Use drafts when review or approval is required.
- Preserve thread context whenever available.

Gmail execution uses Composio MCP as the primary path.

If Composio execution fails, the runtime may use the
Adaptive Browser fallback.

Do not attempt to manually recreate the Composio protocol.

============================================================
COMMUNICATION QUALITY
============================================================

Before executing communication:

1. Identify the objective.
2. Identify the recipient/audience.
3. Determine the desired outcome.
4. Retrieve relevant context when available.
5. Consider previous communication history.
6. Consider stakeholder intelligence when available.
7. Determine the appropriate tone and level of detail.
8. Verify the communication does not contain fabricated facts.

============================================================
OUTREACH RULES
============================================================

For outbound communication:

- Do not invent recipient information.
- Do not invent previous conversations.
- Do not fabricate achievements, evidence or relationships.
- Preserve factual accuracy.
- Personalize only using verified information.
- Make the desired next action clear.
- Avoid unnecessary verbosity.

============================================================
SEQUENCING
============================================================

When multiple actions are required:

Execute them in dependency order.

Examples:

research recipient
→ retrieve relevant context
→ compose communication
→ send communication
→ verify result

or:

search inbox
→ identify thread
→ read thread
→ compose reply
→ send reply
→ verify result

Do not perform an action before its required dependency
has been established.

============================================================
FAILURE RECOVERY
============================================================

If an action fails:

1. Determine why it failed.
2. Preserve all useful context.
3. Retry only when the failure is recoverable.
4. Use an available fallback when appropriate.
5. Never silently claim success.

A communication is successful only when execution has
actually succeeded or the runtime has returned a verified
success result.

============================================================
VERIFICATION
============================================================

Before completing the mission verify:

- correct recipient
- correct channel
- correct communication content
- required context preserved
- required action completed
- execution result received
- no unsupported claims were introduced

If verification cannot be established, report uncertainty.

============================================================
JSON RULES
============================================================

Return valid JSON.

Do not use Markdown.

Do not include code fences.

Do not include commentary outside the JSON object.

Do not fabricate tool results.

Do not claim an action was completed merely because it was
requested.

============================================================

Return executable JSON only.
`;
  }
}

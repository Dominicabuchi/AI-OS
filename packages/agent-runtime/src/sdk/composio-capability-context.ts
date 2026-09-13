import capabilityMap from "../../../../composio-agent-capability-map.json";

export function composioCapabilityContext(agent: string): string {
  const capability = (capabilityMap as Record<string, {
    toolkits?: string[];
    actions?: string[];
  }>)[agent];

  if (!capability) {
    return "";
  }

  return `

============================================================
COMPOSIO EXTERNAL CAPABILITIES
============================================================

AGENT:
${agent}

AUTHORIZED TOOLKITS:
${(capability.toolkits ?? []).map(x => `- ${x}`).join("\n") || "- none"}

VERIFIED ACTIONS:
${(capability.actions ?? []).map(x => `- ${x}`).join("\n") || "- none"}

EXECUTION RULE:
Use the universal "composio" tool to execute these external
capabilities when the mission requires them.

Only use verified actions listed above.
Do not invent Composio action names.
Respect mission authorization and execution constraints.
`;
}

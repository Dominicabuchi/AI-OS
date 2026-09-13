import { getAgents } from "@ai-os/agent-runtime";
import { getTools } from "../registry";

type CertificationResult = {
  agentId: string;
  name?: string;
  passed: boolean;
  checks: {
    agentRegistered: boolean;
    promptPresent: boolean;
    toolsAvailable: boolean;
  };
  tools: string[];
  errors: string[];
};

function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — AGENT CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const agents = getAgents();
  const tools = getTools();

  console.log(`Agents discovered: ${agents.length}`);
  console.log(`Tools discovered:  ${tools.length}`);
  console.log("");

  const results: CertificationResult[] = [];

  for (const agent of agents) {
    const errors: string[] = [];

    const agentRegistered = Boolean(agent?.id);

    const promptValue =
      (agent as any)?.prompt ??
      (agent as any)?.systemPrompt ??
      (agent as any)?.instructions ??
      "";

    const promptPresent =
      typeof promptValue === "string" &&
      promptValue.trim().length > 0;

    const toolIds = tools
      .map((tool: any) => tool?.id)
      .filter(
        (id: unknown): id is string =>
          typeof id === "string" && id.length > 0,
      );

    const toolsAvailable = toolIds.length > 0;

    if (!agentRegistered) {
      errors.push("Agent has no registered id");
    }

    if (!promptPresent) {
      errors.push("Agent has no detectable prompt/instructions");
    }

    if (!toolsAvailable) {
      errors.push("No tools registered");
    }

    results.push({
      agentId: agent?.id ?? "unknown",
      name: (agent as any)?.name,
      passed:
        agentRegistered &&
        promptPresent &&
        toolsAvailable,
      checks: {
        agentRegistered,
        promptPresent,
        toolsAvailable,
      },
      tools: toolIds,
      errors,
    });
  }

  console.log("============================================================");
  console.log("=== AGENT RESULTS ===");
  console.log("============================================================");

  for (const result of results) {
    console.log(
      `${result.passed ? "✓" : "✗"} ${result.agentId}` +
        (result.name ? ` (${result.name})` : ""),
    );

    console.log(
      `  registered: ${result.checks.agentRegistered}`,
    );

    console.log(
      `  prompt:     ${result.checks.promptPresent}`,
    );

    console.log(
      `  tools:      ${result.checks.toolsAvailable}`,
    );

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.log(`  ERROR: ${error}`);
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  console.log("");
  console.log("============================================================");
  console.log("=== CERTIFICATION SUMMARY ===");
  console.log("============================================================");
  console.log(`Agents:  ${results.length}`);
  console.log(`Passed:  ${passed}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Tools:   ${tools.length}`);
  console.log("");

  if (failed > 0) {
    console.log("✗ AGENT FOUNDATION CERTIFICATION FAILED");
    console.log("");
    process.exit(1);
  }

  console.log("✓ AGENT FOUNDATION CERTIFICATION PASSED");
  console.log("");
}

main();

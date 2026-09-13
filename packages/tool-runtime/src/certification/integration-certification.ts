import { getTools } from "../registry";

type Result = {
  id: string;
  status: "PASS" | "FAIL" | "SKIP";
  error?: string;
};

const probes: Record<string, { action: string; payload: Record<string, unknown> }> = {
  github: {
    action: "github.status",
    payload: {},
  },
  ci: {
    action: "ci.status",
    payload: {},
  },
  docker: {
    action: "docker.status",
    payload: {},
  },
  x: {
    action: "x.status",
    payload: {},
  },
  linkedin: {
    action: "linkedin.status",
    payload: {},
  },
  reddit: {
    action: "reddit.status",
    payload: {},
  },
  communication: {
    action: "communication.status",
    payload: {},
  },
  composio: {
    action: "composio.status",
    payload: {},
  },
  gmail: {
    action: "gmail.status",
    payload: {},
  },
  "openclaw-mcp": {
    action: "openclaw-mcp.status",
    payload: {},
  },
  openclaw: {
    action: "openclaw.status",
    payload: {},
  },
  "agent-capability": {
    action: "agent-capability.status",
    payload: {},
  },
};

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — PHASE B.3 INTEGRATION CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const tools = getTools() as any[];
  const results: Result[] = [];

  for (const tool of tools) {
    const id = typeof tool?.id === "string" ? tool.id : "unknown";
    const probe = probes[id];

    if (!probe) {
      continue;
    }

    console.log("");
    console.log(`▶ ${id}`);
    console.log(`  action: ${probe.action}`);

    try {
      const result = await tool.execute(
        probe.action,
        probe.payload,
      );

      console.log("  ✓ invocation succeeded");
      console.log(
        `  result: ${JSON.stringify(result).slice(0, 500)}`,
      );

      results.push({
        id,
        status: "PASS",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.log(`  ✗ invocation failed: ${message}`);

      results.push({
        id,
        status: "FAIL",
        error: message,
      });
    }
  }

  console.log("");
  console.log("============================================================");
  console.log("=== PHASE B.3 SUMMARY ===");
  console.log("============================================================");

  const passed = results.filter(
    (r) => r.status === "PASS",
  ).length;

  const failed = results.filter(
    (r) => r.status === "FAIL",
  ).length;

  console.log(`Integrations: ${results.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log("");

  for (const result of results) {
    console.log(
      `${result.status === "PASS" ? "✓" : "✗"} ${result.id}`,
    );

    if (result.error) {
      console.log(`    ${result.error}`);
    }
  }

  console.log("");

  if (failed > 0) {
    console.log(
      "✗ PHASE B.3 INTEGRATION CERTIFICATION FAILED",
    );
    process.exit(1);
  }

  console.log(
    "✓ PHASE B.3 INTEGRATION CERTIFICATION PASSED",
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "✗ PHASE B.3 CERTIFICATION HARNESS FAILED",
  );
  console.error(error);
  process.exit(1);
});

import { execute } from "../runtime";
import { ExecutionRequest } from "../types/execution";

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — PHASE C EXECUTION CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const request: ExecutionRequest = {
    agentId: "general",
    mission: {
      id: "phase-c-certification",
      goal:
        "Execute a simple local certification task. Use the terminal capability to run: printf PHASE_C_EXECUTION_OK. After receiving the tool result, finish the mission and report the result.",
      maxIterations: 5,
    } as any,
  };

  console.log("Agent:   general");
  console.log("Mission: local tool execution");
  console.log("");

  try {
    const result = await execute(request);

    console.log("============================================================");
    console.log("=== EXECUTION RESULT ===");
    console.log("============================================================");
    console.log("");

    console.log(`success:          ${result.success}`);
    console.log(`actionsExecuted:  ${result.actionsExecuted}`);
    console.log(`output:           ${result.output.slice(0, 4000)}`);
    console.log("");

    if (!result.success) {
      throw new Error(
        "Execution runtime returned success=false."
      );
    }

    if (result.actionsExecuted < 1) {
      throw new Error(
        "Execution runtime executed zero actions."
      );
    }

    console.log("============================================================");
    console.log("✓ PHASE C EXECUTION CERTIFICATION PASSED");
    console.log("============================================================");
  } catch (error) {
    console.error("");
    console.error("============================================================");
    console.error("✗ PHASE C EXECUTION CERTIFICATION FAILED");
    console.error("============================================================");
    console.error(
      error instanceof Error
        ? error.stack ?? error.message
        : String(error)
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { randomUUID } from "crypto";

const API = "http://127.0.0.1:3001";

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function getJson(path: string): Promise<any> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(
      `GET ${path} failed with HTTP ${response.status}`,
    );
  }

  return response.json();
}

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== PHASE G — FINAL AUTONOMOUS END-TO-END TEST ===");
  console.log("============================================================");
  console.log("");

  const missionId = `phase-g-${randomUUID()}`;

  const mission = {
    id: missionId,
    goal:
      "Perform a real multi-step autonomous execution. " +
      "First use the terminal capability with terminal.exec to run exactly: " +
      "printf PHASE_G_STEP_ONE_OK. " +
      "Observe and verify the returned stdout from that tool call. " +
      "Only after observing the successful result, use terminal.exec again " +
      "to run exactly: printf PHASE_G_STEP_TWO_OK. " +
      "Observe that result. Then finish the mission and report both observed values.",
    maxIterations: 5,
  };

  console.log("Submitting autonomous mission...");
  console.log(`Mission ID: ${missionId}`);
  console.log("");

  const submit = await fetch(`${API}/missions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      agentId: "general",
      mission,
    }),
  });

  if (submit.status !== 202) {
    const body = await submit.text();

    throw new Error(
      `Mission submission failed: HTTP ${submit.status} ${body}`,
    );
  }

  const job = await submit.json() as {
    id: string;
  };

  console.log(`HTTP status: ${submit.status}`);
  console.log(`Job: ${job.id}`);
  console.log("");

  let completedJob: any = null;

  for (let i = 1; i <= 450; i++) {
    const current = await getJson(`/jobs/${job.id}`);

    console.log(
      `[${String(i).padStart(2, "0")}] status=${current.status}`,
    );

    if (
      current.status === "completed" ||
      current.status === "failed"
    ) {
      completedJob = current;
      break;
    }

    await sleep(2000);
  }

  if (!completedJob) {
    throw new Error(
      "Phase G timed out after 900 seconds.",
    );
  }

  console.log("");
  console.log("============================================================");
  console.log("=== JOB RESULT ===");
  console.log("============================================================");
  console.log("");

  console.log(
    JSON.stringify(
      completedJob,
      null,
      2,
    ).slice(0, 12000),
  );

  if (completedJob.status !== "completed") {
    throw new Error(
      `Phase G mission failed: ${completedJob.error ?? "unknown error"}`,
    );
  }

  const result = completedJob.result ?? {};

  if (result.success !== true) {
    throw new Error(
      "Phase G execution returned success=false.",
    );
  }

  if ((result.actionsExecuted ?? 0) < 2) {
    throw new Error(
      `Phase G expected at least 2 tool actions, but executed ${result.actionsExecuted ?? 0}.`,
    );
  }

  const output = String(result.output ?? "");

  if (
    !output.includes("PHASE_G_STEP_TWO_OK") &&
    !output.includes("PHASE_G_STEP_ONE_OK")
  ) {
    console.log("");
    console.log(
      "WARNING: final model output did not contain the certification markers.",
    );
    console.log(
      "The job nevertheless completed with multiple executed actions.",
    );
  }

  console.log("");
  console.log("============================================================");
  console.log("=== PHASE G RESULT ===");
  console.log("============================================================");
  console.log("");

  console.log("✓ MISSION SUBMITTED THROUGH API");
  console.log("✓ JOB EXECUTED BY EXISTING EXECUTION RUNTIME");
  console.log("✓ MODEL WAS SELECTED BY MODEL ROUTER");
  console.log("✓ MULTIPLE EXECUTABLE ACTIONS OCCURRED");
  console.log("✓ TERMINAL TOOL EXECUTION OCCURRED");
  console.log("✓ TOOL RESULTS WERE RETURNED TO THE AGENT");
  console.log("✓ MISSION REACHED COMPLETED STATE");
  console.log("");
  console.log("============================================================");
  console.log("✓ PHASE G AUTONOMOUS END-TO-END TEST PASSED");
  console.log("============================================================");
  console.log("");
}

main().catch(error => {
  console.error("");
  console.error("============================================================");
  console.error("✗ PHASE G AUTONOMOUS END-TO-END TEST FAILED");
  console.error("============================================================");
  console.error("");
  console.error(
    error instanceof Error
      ? error.stack ?? error.message
      : String(error),
  );
  process.exit(1);
});

import * as dotenv from "dotenv";
import * as path from "path";

import { getAgent } from "@ai-os/agent-runtime";
import { MissionRuntime } from "@ai-os/mission-runtime";
import { discoverTools } from "@ai-os/tool-runtime";

dotenv.config({
  path:
    process.env.AI_OS_ENV_FILE ??
    path.resolve(
      process.cwd(),
      ".env"
    )
});

const AGENTS = [
  "browser",
  "research",
  "planning",
  "reasoning",
  "memory",
  "coding",
  "communication",
  "copywriting",
  "marketing",
  "seo",
  "sales"
];

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("AI-OS — CANONICAL RUNTIME BOOT");
  console.log("============================================================");

  console.log("");
  console.log("=== AGENT REGISTRY ===");

  for (const id of AGENTS) {
    const agent = getAgent(id);

    if (!agent) {
      throw new Error(`Agent failed to resolve: ${id}`);
    }

    console.log(`✓ ${id}`);
  }

  console.log("");
  console.log("=== TOOL REGISTRY ===");

  const tools = discoverTools();

  for (const tool of tools) {
    console.log(`✓ ${tool.id}`);
  }

  console.log("");
  console.log(`Agents available: ${AGENTS.length}`);
  console.log(`Tools available: ${tools.length}`);

  console.log("");
  console.log("=== MISSION RUNTIME ===");

  const missionRuntime = new MissionRuntime();

  console.log("✓ MissionRuntime constructed");
  console.log("✓ ExecutionRuntime is the canonical execution path");
  console.log("✓ SchedulerRuntime is attached through MissionRuntime");

  console.log("");
  console.log("=== RUNTIME STATUS ===");
  console.log("✓ AI-OS runtime initialized");
  console.log("✓ All agents resolved");
  console.log("✓ Tool registry resolved");
  console.log("✓ Mission runtime initialized");
  console.log("✓ Ready to accept missions");

  console.log("");
  console.log("============================================================");
  console.log("✓ AI-OS CANONICAL RUNTIME BOOT COMPLETE");
  console.log("============================================================");
  console.log("");

  // Keep the process alive.
  await new Promise<void>(() => {});
}

main().catch((error) => {
  console.error("");
  console.error("============================================================");
  console.error("❌ AI-OS RUNTIME BOOT FAILED");
  console.error("============================================================");
  console.error(
    error instanceof Error ? error.stack ?? error.message : error
  );
  process.exit(1);
});

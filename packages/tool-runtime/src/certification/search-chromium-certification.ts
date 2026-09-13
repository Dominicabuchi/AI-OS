import { getTool } from "../registry";

async function main(): Promise<void> {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — SEARCH → CHROMIUM CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const tool = getTool("search");

  if (!tool) {
    throw new Error("Search tool is not registered");
  }

  console.log(`Tool:   ${tool.id}`);
  console.log("Action: search");
  console.log("Query:  AI-OS");
  console.log("");

  try {
    const result = await tool.execute("search", {
      query: "AI-OS",
      limit: 5,
    });

    console.log("✓ SEARCH INVOCATION SUCCEEDED");
    console.log("");
    console.log("=== RESULT ===");
    console.log(JSON.stringify(result, null, 2));

    console.log("");
    console.log("============================================================");
    console.log("✓ SEARCH → CHROMIUM CERTIFICATION PASSED");
    console.log("============================================================");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("============================================================");
    console.error("✗ SEARCH → CHROMIUM CERTIFICATION FAILED");
    console.error("============================================================");
    console.error(
      error instanceof Error
        ? error.stack ?? error.message
        : String(error),
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("");
  console.error(
    "✗ SEARCH → CHROMIUM CERTIFICATION HARNESS FAILED",
  );
  console.error(error);
  process.exit(1);
});

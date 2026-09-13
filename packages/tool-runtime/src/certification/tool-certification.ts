import { getTools } from "../registry";

type Result = {
  id: string;
  name?: string;
  registered: boolean;
  executable: boolean;
  status: "PASS" | "FAIL" | "SKIP";
  error?: string;
};

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — PHASE B TOOL CAPABILITY CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const tools = getTools();

  console.log(`Tools discovered: ${tools.length}`);
  console.log("");

  const results: Result[] = [];

  for (const tool of tools as any[]) {
    const id =
      typeof tool?.id === "string"
        ? tool.id
        : "unknown";

    const name =
      typeof tool?.name === "string"
        ? tool.name
        : undefined;

    const registered = Boolean(id && id !== "unknown");

    const executable =
      typeof tool?.execute === "function";

    let status: Result["status"] =
      registered && executable
        ? "PASS"
        : "FAIL";

    let error: string | undefined;

    /*
     * Phase B intentionally does NOT blindly execute
     * destructive/external tools.
     *
     * This phase certifies that the runtime can locate
     * and invoke the tool interface. Live side-effect
     * testing belongs to Phase C.
     */
    if (!registered || !executable) {
      error =
        !registered
          ? "Tool has no valid registered id"
          : "Tool has no executable execute() method";
    }

    results.push({
      id,
      name,
      registered,
      executable,
      status,
      error,
    });
  }

  console.log("============================================================");
  console.log("=== TOOL RESULTS ===");
  console.log("============================================================");

  for (const result of results) {
    const label =
      result.name
        ? `${result.id} (${result.name})`
        : result.id;

    console.log(
      `${result.status === "PASS" ? "✓" : "✗"} ${label}`,
    );

    console.log(
      `  registered:  ${result.registered}`,
    );

    console.log(
      `  executable:  ${result.executable}`,
    );

    if (result.error) {
      console.log(
        `  ERROR:       ${result.error}`,
      );
    }
  }

  const passed =
    results.filter(
      (r) => r.status === "PASS",
    ).length;

  const failed =
    results.filter(
      (r) => r.status === "FAIL",
    ).length;

  const skipped =
    results.filter(
      (r) => r.status === "SKIP",
    ).length;

  console.log("");
  console.log("============================================================");
  console.log("=== PHASE B SUMMARY ===");
  console.log("============================================================");
  console.log(`Tools:    ${results.length}`);
  console.log(`Passed:   ${passed}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Skipped:  ${skipped}`);
  console.log("");

  if (failed > 0) {
    console.log(
      "✗ PHASE B TOOL FOUNDATION CERTIFICATION FAILED",
    );
    process.exit(1);
  }

  console.log(
    "✓ PHASE B TOOL FOUNDATION CERTIFICATION PASSED",
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "✗ PHASE B CERTIFICATION HARNESS FAILED",
  );
  console.error(error);
  process.exit(1);
});

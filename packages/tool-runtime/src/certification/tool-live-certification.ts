import { getTools } from "../registry";

type Result = {
  id: string;
  name?: string;
  status: "PASS" | "FAIL" | "SKIP";
  error?: string;
};

type Probe = {
  action: string;
  payload: Record<string, unknown>;
};

const probes: Record<string, Probe> = {
  browser: {
    action: "browser.goto",
    payload: {
      url: "https://example.com",
    },
  },

  memory: {
    action: "memory.search",
    payload: {
      query: "AI-OS certification probe",
    },
  },

  git: {
    action: "git.status",
    payload: {},
  },

  http: {
    action: "http.request",
    payload: {
      method: "GET",
      url: "https://example.com",
    },
  },

  search: {
    action: "search",
    payload: {
      query: "AI-OS certification probe",
    },
  },

  terminal: {
    action: "terminal.exec",
    payload: {
      command: "printf AI_OS_TOOL_PROBE",
    },
  },

  files: {
    action: "files.exists",
    payload: {
      path: "package.json",
    },
  },

  task: {
    action: "task.create",
    payload: {
      title: "AI-OS certification probe",
    },
  },
};

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("=== AI-OS — PHASE B.2 LIVE TOOL CERTIFICATION ===");
  console.log("============================================================");
  console.log("");

  const tools = getTools() as any[];

  console.log(`Tools discovered: ${tools.length}`);
  console.log("");

  const results: Result[] = [];

  for (const tool of tools) {
    const id =
      typeof tool?.id === "string"
        ? tool.id
        : "unknown";

    const name =
      typeof tool?.name === "string"
        ? tool.name
        : undefined;

    const probe = probes[id];

    if (!probe) {
      results.push({
        id,
        name,
        status: "SKIP",
      });

      console.log(`○ ${id} — no safe probe defined`);
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
      let preview: string;
      try {
        preview = JSON.stringify(result);
      } catch {
        preview = String(result);
      }

      if (preview === undefined) {
        preview = String(result);
      }

      console.log(
        `  result: ${preview.slice(0, 500)}`,
      );

      results.push({
        id,
        name,
        status: "PASS",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.log(
        `  ✗ invocation failed: ${message}`,
      );

      results.push({
        id,
        name,
        status: "FAIL",
        error: message,
      });
    }
  }

  console.log("");
  console.log("============================================================");
  console.log("=== PHASE B.2 SUMMARY ===");
  console.log("============================================================");

  const passed = results.filter(
    (r) => r.status === "PASS",
  ).length;

  const failed = results.filter(
    (r) => r.status === "FAIL",
  ).length;

  const skipped = results.filter(
    (r) => r.status === "SKIP",
  ).length;

  console.log(`Tools:    ${results.length}`);
  console.log(`Passed:   ${passed}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Skipped:  ${skipped}`);
  console.log("");

  for (const result of results) {
    console.log(
      `${result.status === "PASS"
        ? "✓"
        : result.status === "FAIL"
          ? "✗"
          : "○"} ${result.id}`,
    );

    if (result.error) {
      console.log(`    ${result.error}`);
    }
  }

  console.log("");

  if (failed > 0) {
    console.log(
      "✗ PHASE B.2 LIVE TOOL CERTIFICATION FAILED",
    );
    process.exit(1);
  }

  console.log(
    "✓ PHASE B.2 LIVE TOOL CERTIFICATION PASSED",
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "✗ PHASE B.2 CERTIFICATION HARNESS FAILED",
  );
  console.error(error);
  process.exit(1);
});

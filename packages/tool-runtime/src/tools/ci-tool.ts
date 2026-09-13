import { Tool } from "../types/tool";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export class CITool implements Tool {
  readonly id = "ci";
  readonly name = "CI/CD";
  readonly description =
    "Build, test, inspect and trigger CI/CD workflows.";

  canExecute(action: string): boolean {
    return action.startsWith("ci.") || action.startsWith("cd.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case "ci.test":
        return this.run("npm", ["test"]);

      case "ci.build":
        return this.run("npm", ["run", "build"]);

      case "ci.typecheck":
        return this.run("npm", ["run", "typecheck"]);

      case "ci.workflow.list":
        return this.run("gh", ["workflow", "list"]);

      case "ci.workflow.run":
        return this.run("gh", [
          "workflow",
          "run",
          String(payload.workflow ?? "")
        ]);

      case "ci.run.list":
        return this.run("gh", ["run", "list"]);

      case "ci.run.view":
        return this.run("gh", [
          "run",
          "view",
          String(payload.runId ?? "")
        ]);

      case "cd.release":
        return this.run("gh", [
          "release",
          "create",
          String(payload.tag ?? ""),
          "--title",
          String(payload.title ?? payload.tag ?? ""),
          "--notes",
          String(payload.notes ?? "")
        ]);

      default:
        throw new Error(`Unsupported CI/CD action: ${action}`);
    }
  }

  private async run(
    command: string,
    args: string[]
  ): Promise<unknown> {
    const result = await execFileAsync(command, args);

    return {
      stdout: result.stdout,
      stderr: result.stderr
    };
  }
}

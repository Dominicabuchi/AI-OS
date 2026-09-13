import { Tool } from "../types/tool";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export class GitHubTool implements Tool {
  readonly id = "github";
  readonly name = "GitHub";
  readonly description =
    "GitHub repository, issue, pull request, workflow and release operations.";

  canExecute(action: string): boolean {
    return action.startsWith("github.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    const args = this.args(action, payload);
    const result = await execFileAsync("gh", args);

    return {
      stdout: result.stdout,
      stderr: result.stderr
    };
  }

  private args(
    action: string,
    payload: Record<string, unknown>
  ): string[] {
    const repo = payload.repo ? ["--repo", String(payload.repo)] : [];

    switch (action) {
      case "github.auth.status":
        return ["auth", "status"];

      case "github.repo.view":
        return ["repo", "view", ...repo];

      case "github.issue.list":
        return ["issue", "list", ...repo];

      case "github.issue.create":
        return [
          "issue", "create",
          ...repo,
          "--title", String(payload.title ?? ""),
          "--body", String(payload.body ?? "")
        ];

      case "github.pr.list":
        return ["pr", "list", ...repo];

      case "github.pr.create":
        return [
          "pr", "create",
          ...repo,
          "--title", String(payload.title ?? ""),
          "--body", String(payload.body ?? "")
        ];

      case "github.pr.view":
        return [
          "pr", "view",
          String(payload.number ?? ""),
          ...repo
        ];

      case "github.workflow.list":
        return ["workflow", "list", ...repo];

      case "github.workflow.run":
        return [
          "workflow", "run",
          String(payload.workflow ?? ""),
          ...repo
        ];

      case "github.workflow.view":
        return [
          "run", "view",
          String(payload.runId ?? ""),
          ...repo
        ];

      case "github.release.list":
        return ["release", "list", ...repo];

      default:
        throw new Error(`Unsupported GitHub action: ${action}`);
    }
  }
}

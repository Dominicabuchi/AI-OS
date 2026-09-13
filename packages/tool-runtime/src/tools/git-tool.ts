import { Tool } from "../types/tool";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GitTool implements Tool {

  readonly id = "git";

  readonly name = "Git";

  readonly description = "Git operations";

  canExecute(action: string): boolean {
    return action.startsWith("git.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    switch (action) {

      case "git.status":
        return (await execAsync("git status")).stdout;

      case "git.pull":
        return (await execAsync("git pull")).stdout;

      case "git.push":
        return (await execAsync("git push")).stdout;

      case "git.add":
        return (await execAsync(
          `git add ${String(payload.files ?? ".")}`
        )).stdout;

      case "git.commit":
        return (await execAsync(
          `git commit -m "${String(payload.message)}"`
        )).stdout;

      default:
        throw new Error(
          `Unsupported git action: ${action}`
        );

    }

  }

}

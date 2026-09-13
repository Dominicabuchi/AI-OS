import { Tool } from "../types/tool";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class TerminalTool implements Tool {

  readonly id = "terminal";

  readonly name = "Terminal";

  readonly description = "Execute terminal commands";

  canExecute(action: string): boolean {
    return action.startsWith("terminal.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    switch (action) {

      case "terminal.exec": {

        const command = String(payload.command);

        const { stdout, stderr } = await execAsync(command);

        return {
          stdout,
          stderr
        };

      }

      default:
        throw new Error(
          `Unsupported terminal action: ${action}`
        );

    }

  }

}

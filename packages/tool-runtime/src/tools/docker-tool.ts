import { Tool } from "../types/tool";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export class DockerTool implements Tool {
  readonly id = "docker";
  readonly name = "Docker";
  readonly description =
    "Build, inspect, run and manage Docker containers and images.";

  canExecute(action: string): boolean {
    return action.startsWith("docker.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case "docker.version":
        return this.run(["version"]);

      case "docker.info":
        return this.run(["info"]);

      case "docker.images":
        return this.run(["images"]);

      case "docker.containers":
        return this.run(["ps", "-a"]);

      case "docker.build":
        return this.run([
          "build",
          "-t",
          String(payload.tag ?? "ai-os:latest"),
          String(payload.context ?? ".")
        ]);

      case "docker.run":
        return this.run([
          "run",
          String(payload.image ?? "")
        ]);

      case "docker.stop":
        return this.run([
          "stop",
          String(payload.container ?? "")
        ]);

      case "docker.logs":
        return this.run([
          "logs",
          String(payload.container ?? "")
        ]);

      default:
        throw new Error(`Unsupported Docker action: ${action}`);
    }
  }

  private async run(args: string[]): Promise<unknown> {
    const result = await execFileAsync("docker", args);

    return {
      stdout: result.stdout,
      stderr: result.stderr
    };
  }
}

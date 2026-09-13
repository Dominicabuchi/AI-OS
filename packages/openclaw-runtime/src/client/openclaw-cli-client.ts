import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface OpenClawCliExecution {
  success: boolean;
  output?: unknown;
  error?: string;
}

export class OpenClawCliClient {
  private readonly binary =
    process.env.OPENCLAW_BIN ?? "openclaw";

  async run(
    args: string[],
    options: {
      timeout?: number;
    } = {},
  ): Promise<string> {
    try {
      const result = await execFileAsync(
        this.binary,
        args,
        {
          timeout: options.timeout ?? 300_000,
          maxBuffer: 20 * 1024 * 1024,
          env: process.env,
        },
      );

      return result.stdout;
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        stdout?: string;
        stderr?: string;
        code?: number | string;
      };

      const stderr =
        typeof err.stderr === "string"
          ? err.stderr.trim()
          : "";

      const stdout =
        typeof err.stdout === "string"
          ? err.stdout.trim()
          : "";

      const details = [
        stderr
          ? `stderr: ${stderr}`
          : "",
        stdout
          ? `stdout: ${stdout}`
          : "",
        typeof err.code !== "undefined"
          ? `exitCode: ${err.code}`
          : "",
      ].filter(Boolean);

      throw new Error(
        [
          err.message ?? "OpenClaw CLI execution failed.",
          ...details,
        ].join("\n"),
      );
    }
  }

  async status(): Promise<string> {
    return this.run(
      ["gateway", "status", "--require-rpc"],
      { timeout: 30_000 },
    );
  }

  async executeCapability(
    capability: string,
    payload: Record<string, unknown>,
  ): Promise<OpenClawCliExecution> {
    try {
      const [group, ...rest] =
        capability.split(".");

      const command = rest.join("-");

      if (!group || !command) {
        return {
          success: false,
          error:
            `Invalid OpenClaw capability: ${capability}`,
        };
      }

      const args = [
        "infer",
        group,
        command,
        ...this.payloadArgs(payload),
      ];

      const output =
        await this.run(args, {
          timeout: 300_000,
        });

      return {
        success: true,
        output: this.parseOutput(output),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  private payloadArgs(
    payload: Record<string, unknown>,
  ): string[] {
    const args: string[] = [];

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value === "boolean") {
        if (value) {
          args.push(`--${key}`);
        }
        continue;
      }

      if (
        typeof value === "string" &&
        key.startsWith("_")
      ) {
        args.push(value);
        continue;
      }

      args.push(`--${key}`);

      if (typeof value === "object") {
        args.push(JSON.stringify(value));
      } else {
        args.push(String(value));
      }
    }

    return args;
  }

  private parseOutput(
    output: string,
  ): unknown {
    const trimmed = output.trim();

    if (!trimmed) {
      return "";
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
}

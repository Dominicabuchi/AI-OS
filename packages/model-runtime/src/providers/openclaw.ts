import {
  OpenClawCliClient,
} from "@ai-os/openclaw-runtime";

import {
  mkdtemp,
  writeFile,
  rm,
} from "node:fs/promises";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from "../types/provider";

export class OpenClawProvider implements ModelProvider {
  readonly id = "openclaw";
  readonly name = "OpenClaw";

  private readonly cli =
    new OpenClawCliClient();

  async generate(
    request: ModelRequest,
  ): Promise<ModelResponse> {
    const system = request.system ?? "";

    const message = [
      system
        ? `SYSTEM INSTRUCTIONS:\n${system}`
        : "",
      `MODEL REQUEST:\n${request.prompt}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const directory = await mkdtemp(
      join(tmpdir(), "ai-os-openclaw-"),
    );

    const messageFile =
      join(directory, "message.txt");

    /*
     * Every AI-OS model request gets its own OpenClaw
     * session. This prevents the persistent main session
     * from accumulating previous AI-OS prompts/results.
     */
    const sessionKey =
      `agent:ai-os-model:ai-os-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    try {
      await writeFile(
        messageFile,
        message,
        "utf8",
      );

      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.log(
          "[AI-OS TRACE][provider.request]",
          JSON.stringify({
            requestedModel: request.model,
            resolvedModel: request.model.startsWith("novita/")
              ? request.model
              : `novita/${request.model}`,
            sessionKey,
          }),
        );
      }

      const output =
        await this.cli.run(
          [
            "agent",
            "--agent",
            "ai-os-model",
            "--model",
            request.model.startsWith("novita/")
              ? request.model
              : `novita/${request.model}`,
            "--session-key",
            sessionKey,
            "--message-file",
            messageFile,
            "--json",
          ],
          {
            timeout: Number(
              process.env.AI_OS_MODEL_TIMEOUT_MS ?? 120_000,
            ),
          },
        );

      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.log("[AI-OS TRACE][provider.raw-output]");
        console.log(output);
        console.log("[AI-OS TRACE][provider.raw-output.end]");
      }

      let text = output.trim();
      let parsedEnvelope: unknown;

      try {
        const parsed =
          JSON.parse(text);

        parsedEnvelope = parsed;

        /*
         * OpenClaw CLI JSON envelope:
         *
         * {
         *   result: {
         *     payloads: [
         *       { text: "..." }
         *     ]
         *   }
         * }
         */

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          const root =
            parsed as Record<string, unknown>;

          const result =
            root.result;

          if (
            result &&
            typeof result === "object"
          ) {
            const resultObject =
              result as Record<string, unknown>;

            const payloads =
              resultObject.payloads;

            if (
              Array.isArray(payloads) &&
              payloads.length > 0
            ) {
              const first =
                payloads[0];

              if (
                first &&
                typeof first === "object"
              ) {
                const payload =
                  first as Record<string, unknown>;

                if (
                  typeof payload.text === "string"
                ) {
                  text = payload.text;
                }
              }
            }
          }

          if (
            text === output.trim() &&
            typeof root.output === "string"
          ) {
            text = root.output;
          }

          if (
            text === output.trim() &&
            typeof root.text === "string"
          ) {
            text = root.text;
          }

          if (
            text === output.trim() &&
            typeof root.message === "string"
          ) {
            text = root.message;
          }
        }
      } catch {
        /*
         * OpenClaw returned plain text rather than JSON.
         * Keep the raw output.
         */
      }

      text = text.trim();

      if (!text) {
        throw new Error(
          "OpenClaw returned an empty model response.",
        );
      }

      const containsSemanticFailure = (
        value: unknown,
        seen = new Set<object>(),
      ): boolean => {
        if (!value || typeof value !== "object") {
          return false;
        }

        if (seen.has(value as object)) {
          return false;
        }

        seen.add(value as object);

        if (Array.isArray(value)) {
          return value.some((entry) =>
            containsSemanticFailure(entry, seen),
          );
        }

        const object =
          value as Record<string, unknown>;

        for (const [key, entry] of Object.entries(object)) {
          if (
            (key === "stopReason" ||
              key === "finishReason") &&
            entry === "error"
          ) {
            return true;
          }

          if (
            key === "livenessState" &&
            entry === "blocked"
          ) {
            return true;
          }

          if (containsSemanticFailure(entry, seen)) {
            return true;
          }
        }

        return false;
      };

      if (
        text === "LLM request failed." ||
        containsSemanticFailure(parsedEnvelope)
      ) {
        throw new Error(
          `OpenClaw model request failed semantically for ${request.model}: ${text}`,
        );
      }

      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.log("[AI-OS TRACE][provider.extracted-text]");
        console.log(text);
        console.log("[AI-OS TRACE][provider.extracted-text.end]");
      }

      return {
        text,
        provider: this.name,
        model: request.model,
      };
    } catch (error) {
      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.error(
          "[AI-OS TRACE][provider.error]",
          JSON.stringify({
            requestedModel: request.model,
            sessionKey,
            error:
              error instanceof Error
                ? error.stack ?? error.message
                : String(error),
          }),
        );
      }
      throw error;
    } finally {
      await rm(
        directory,
        {
          recursive: true,
          force: true,
        },
      );
    }
  }
}

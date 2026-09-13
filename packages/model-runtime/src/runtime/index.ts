import "../router/default";
import { getProvider } from "../router";
import {
  selectModelDecision,
  getTaskFamily,
  updateModelCatalog,
} from "../router/model-router";

import {
  refreshOpenRouterCatalog,
} from "../router/openrouter-catalog";

import {
  recordOutcome,
} from "../performance/performance-store";

const MODEL_FAILURE_COOLDOWN_MS =
  Number(
    process.env.AI_OS_MODEL_FAILURE_COOLDOWN_MS ??
      300_000,
  );

const modelFailureCooldowns =
  new Map<string, number>();

function modelFamily(
  model: string,
): string {
  if (model.startsWith("qwen/")) {
    return "qwen";
  }

  if (model.startsWith("moonshotai/")) {
    return "kimi";
  }

  if (model.startsWith("deepseek/")) {
    return "deepseek";
  }

  return "unknown";
}

function modelIsCoolingDown(
  model: string,
): boolean {
  const until =
    modelFailureCooldowns.get(model);

  if (!until) {
    return false;
  }

  if (Date.now() >= until) {
    modelFailureCooldowns.delete(model);
    return false;
  }

  return true;
}

export interface GenerateOptions {
  agent: string;
  task: string;
  prompt: string;
  system?: string;
}

export async function generate(
  options: GenerateOptions,
) {
  const liveCatalog =
    await refreshOpenRouterCatalog();

  updateModelCatalog(
    liveCatalog,
  );

  const provider = getProvider("openrouter");

  if (!provider) {
    throw new Error(
      "OpenRouter model provider is not registered.",
    );
  }

  const selection =
    selectModelDecision(
      options.agent,
      options.task,
    );

  const taskFamily =
    getTaskFamily(
      options.agent,
      options.task,
    );

  console.log("");
  console.log(
    `[AI-OS MODEL ROUTER] ${selection.model}`,
  );
  console.log(
    `[AI-OS MODEL ROUTER] family=${selection.family} score=${selection.score}`,
  );
  console.log(
    `[AI-OS MODEL ROUTER] ${selection.reason}`,
  );
  console.log(
    `[AI-OS MODEL ROUTER] alternatives=${selection.alternatives.join(", ")}`,
  );

  const allCandidates = [
    selection.model,
    ...selection.alternatives,
  ].filter(
    (model, index, models) =>
      models.indexOf(model) === index,
  );

  const healthyCandidates =
    allCandidates.filter(
      (model) =>
        !modelIsCoolingDown(model),
    );

  const cooledCandidates =
    allCandidates.filter(
      (model) =>
        !healthyCandidates.includes(model),
    );

  /*
   * Cooldown is a preference, not a permanent exclusion.
   *
   * Pass 1:
   *   Try every currently healthy candidate.
   *
   * Pass 2:
   *   If every healthy candidate fails, make one last-resort
   *   attempt with candidates that were cooling down when this
   *   generate() call began.
   *
   * A model is never attempted twice inside one generate() call.
   * This prevents a mission from failing merely because a valid
   * fallback happened to be cooling down from an earlier iteration.
   */
  for (const model of cooledCandidates) {
    console.log(
      `[AI-OS MODEL ROUTER] cooldown-skip=${model}`,
    );
  }

  const failures: string[] = [];
  const attemptedModels =
    new Set<string>();

  const candidatePasses = [
    {
      label: "healthy",
      models:
        healthyCandidates.length > 0
          ? healthyCandidates
          : allCandidates,
    },
    {
      label: "last-resort-cooldown",
      models:
        healthyCandidates.length > 0
          ? cooledCandidates
          : [],
    },
  ];

  for (const pass of candidatePasses) {
    if (
      pass.label === "last-resort-cooldown" &&
      pass.models.length > 0
    ) {
      console.warn(
        `[AI-OS MODEL ROUTER] healthy pool exhausted; trying cooled models as last resort`,
      );
    }

    for (const model of pass.models) {
      if (attemptedModels.has(model)) {
        continue;
      }

      attemptedModels.add(model);

      const attemptStartedAt = Date.now();

      try {
        if (
          pass.label === "last-resort-cooldown"
        ) {
          console.warn(
            `[AI-OS MODEL ROUTER] last-resort-cooldown=${model}`,
          );
        } else if (
          model !== selection.model
        ) {
          console.log(
            `[AI-OS MODEL ROUTER] fallback=${model}`,
          );
        }

        const response =
          await provider.generate({
            model,
            prompt: options.prompt,
            system: options.system,
          });

        modelFailureCooldowns.delete(model);

        return {
          ...response,
          model,
          taskFamily,
          selection,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        failures.push(
          `${model}: ${message}`,
        );

        const latencyMs =
          Date.now() - attemptStartedAt;

        modelFailureCooldowns.set(
          model,
          Date.now() +
            MODEL_FAILURE_COOLDOWN_MS,
        );

        try {
          recordOutcome({
            model,
            family: modelFamily(model),
            taskFamily,
            success: false,
            quality: 0,
            toolSuccess: 0,
            latencyMs,
          });
        } catch (recordError) {
          console.error(
            `[AI-OS MODEL ROUTER] failed to record model failure=${model}: ${
              recordError instanceof Error
                ? recordError.message
                : String(recordError)
            }`,
          );
        }

        console.error(
          `[AI-OS MODEL ROUTER] model failed=${model}: ${message}`,
        );

        console.error(
          `[AI-OS MODEL ROUTER] cooldown=${model} ms=${MODEL_FAILURE_COOLDOWN_MS}`,
        );
      }
    }
  }

  throw new Error(
    `All models failed for ${taskFamily} after healthy and last-resort cooldown passes: ${failures.join(" | ")}`,
  );

}

import type { ModelCandidate } from "./model-router";

type Family = ModelCandidate["family"];

type OpenRouterModel = {
  id?: string;
  context_length?: number;
  supported_parameters?: string[];
};

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[];
};

const CERTIFIED_BASELINE: Record<
  Family,
  ModelCandidate
> = {
  qwen: {
    id: "qwen/qwen3.8-max-0902",
    family: "qwen",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 96,
      reasoning: 99,
      research: 98,
      writing: 95,
      planning: 99,
      toolUse: 98,
      longContext: 99,
      multimodal: 0,
      speed: 86,
    },
  },

  kimi: {
    id: "moonshotai/kimi-k3",
    family: "kimi",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 98,
      reasoning: 98,
      research: 97,
      writing: 97,
      planning: 98,
      toolUse: 99,
      longContext: 99,
      multimodal: 98,
      speed: 88,
    },
  },

  deepseek: {
    id: "deepseek/deepseek-v4-pro-0813",
    family: "deepseek",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 97,
      reasoning: 99,
      research: 97,
      writing: 94,
      planning: 98,
      toolUse: 98,
      longContext: 99,
      multimodal: 0,
      speed: 90,
    },
  },
};

const AUTHOR_BY_FAMILY: Record<Family, string> = {
  qwen: "qwen",
  kimi: "moonshotai",
  deepseek: "deepseek",
};

const CATALOG_TTL_MS = Number(
  process.env.AI_OS_OPENROUTER_CATALOG_TTL_MS ??
    3_600_000,
);

let cachedCatalog: ModelCandidate[] | null = null;
let cachedAt = 0;

function isEligible(
  model: OpenRouterModel,
): model is OpenRouterModel & { id: string } {
  if (!model.id) {
    return false;
  }

  if (model.id.endsWith(":batch")) {
    return false;
  }

  const supported =
    model.supported_parameters ?? [];

  return (
    supported.includes("tools") &&
    supported.includes("tool_choice") &&
    supported.includes("max_tokens")
  );
}

async function fetchBestFamilyModel(
  family: Family,
): Promise<ModelCandidate> {
  const author =
    AUTHOR_BY_FAMILY[family];

  const params =
    new URLSearchParams({
      model_authors: author,
      supported_parameters: "tools",
      sort: "intelligence-high-to-low",
    });

  const response = await fetch(
    `https://openrouter.ai/api/v1/models?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `OpenRouter catalog HTTP ${response.status} for ${family}`,
    );
  }

  const json =
    (await response.json()) as OpenRouterModelsResponse;

  const best =
    (json.data ?? []).find(isEligible);

  if (!best) {
    throw new Error(
      `No eligible OpenRouter model found for ${family}`,
    );
  }

  const baseline =
    CERTIFIED_BASELINE[family];

  return {
    ...baseline,
    id: best.id,
    contextWindow:
      typeof best.context_length === "number" &&
      best.context_length > 0
        ? best.context_length
        : baseline.contextWindow,
  };
}

export async function refreshOpenRouterCatalog(): Promise<
  ModelCandidate[]
> {
  const now = Date.now();

  if (
    cachedCatalog &&
    now - cachedAt < CATALOG_TTL_MS
  ) {
    return [...cachedCatalog];
  }

  try {
    const resolved =
      await Promise.all([
        fetchBestFamilyModel("qwen"),
        fetchBestFamilyModel("kimi"),
        fetchBestFamilyModel("deepseek"),
      ]);

    cachedCatalog = resolved;
    cachedAt = now;

    console.log(
      `[AI-OS OPENROUTER CATALOG] ${resolved
        .map(
          (model) =>
            `${model.family}=${model.id}`,
        )
        .join(" ")}`,
    );

    return [...resolved];
  } catch (error) {
    console.warn(
      `[AI-OS OPENROUTER CATALOG] refresh failed; using certified baseline: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    );

    cachedCatalog =
      Object.values(
        CERTIFIED_BASELINE,
      ).map((model) => ({
        ...model,
      }));

    cachedAt = now;

    return [...cachedCatalog];
  }
}

export function getCertifiedBaselineCatalog():
  ModelCandidate[] {
  return Object.values(
    CERTIFIED_BASELINE,
  ).map((model) => ({
    ...model,
  }));
}

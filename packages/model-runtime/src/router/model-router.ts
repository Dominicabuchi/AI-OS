import { adaptiveModelScore } from "../performance";

export type TaskProfile = {
  coding: number;
  reasoning: number;
  research: number;
  writing: number;
  planning: number;
  toolUse: number;
  longContext: number;
  multimodal: number;
  speed: number;
};

export type ModelCandidate = {
  id: string;
  family: "deepseek" | "kimi" | "qwen";
  capabilities: TaskProfile;
  contextWindow: number;
};

export type ModelSelection = {
  model: string;
  family: ModelCandidate["family"];
  score: number;
  reason: string;
  alternatives: string[];
};

/*
 * AI-OS Chinese open/open-weight model pool.
 *
 * These are current OpenRouter model IDs rather than the obsolete
 * DeepSeek R1 / Qwen 235B defaults that were previously hard-coded.
 *
 * The catalog is intentionally isolated here so it can later be
 * refreshed automatically from OpenRouter.
 */
let MODELS: ModelCandidate[] = [
  {
    id: "moonshotai/kimi-k3",
    family: "kimi",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 97,
      reasoning: 97,
      research: 96,
      writing: 96,
      planning: 97,
      toolUse: 98,
      longContext: 96,
      multimodal: 98,
      speed: 88,
    },
  },

  {
    id: "qwen/qwen3.8-max-0902",
    family: "qwen",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 96,
      reasoning: 98,
      research: 97,
      writing: 94,
      planning: 98,
      toolUse: 96,
      longContext: 96,
      multimodal: 0,
      speed: 84,
    },
  },

  {
    id: "deepseek/deepseek-v4.1-flash",
    family: "deepseek",
    contextWindow: 1_048_576,
    capabilities: {
      coding: 96,
      reasoning: 97,
      research: 95,
      writing: 92,
      planning: 96,
      toolUse: 96,
      longContext: 91,
      multimodal: 0,
      speed: 90,
    },
  },
];

function classifyTask(
  agent: string,
  task: string,
): TaskProfile {
  const text = `${agent} ${task}`.toLowerCase();

  const profile: TaskProfile = {
    coding: 25,
    reasoning: 20,
    research: 15,
    writing: 10,
    planning: 15,
    toolUse: 20,
    longContext: 10,
    multimodal: 0,
    speed: 10,
  };

  if (
    /code|coding|debug|typescript|javascript|python|program|repository|repo|bug|compile|build|software|api|implementation|refactor|test/.test(
      text,
    )
  ) {
    profile.coding += 65;
    profile.toolUse += 35;
    profile.reasoning += 35;
    profile.longContext += 25;
  }

  if (
    /research|investigate|analy[sz]e|compare|study|find|search|evidence|sources/.test(
      text,
    )
  ) {
    profile.research += 65;
    profile.reasoning += 35;
    profile.longContext += 30;
  }

  if (
    /plan|planning|strategy|architecture|design|decompose|roadmap/.test(
      text,
    )
  ) {
    profile.planning += 65;
    profile.reasoning += 40;
  }

  if (
    /write|writing|copy|email|content|marketing|sales|communication|rewrite/.test(
      text,
    )
  ) {
    profile.writing += 65;
  }

  if (
    /browser|website|linkedin|reddit|x\b|gmail|click|navigate|post|tool|execute|automation/.test(
      text,
    )
  ) {
    profile.toolUse += 65;
  }

  if (
    /image|video|visual|screenshot|multimodal/.test(
      text,
    )
  ) {
    profile.multimodal += 80;
  }

  if (
    /large|entire|whole|codebase|long|documents|many files|massive/.test(
      text,
    )
  ) {
    profile.longContext += 65;
  }

  if (
    /fast|quick|simple|small|cheap/.test(
      text,
    )
  ) {
    profile.speed += 65;
  }

  return profile;
}

function score(
  model: ModelCandidate,
  task: TaskProfile,
): number {
  const weights: (keyof TaskProfile)[] = [
    "coding",
    "reasoning",
    "research",
    "writing",
    "planning",
    "toolUse",
    "longContext",
    "multimodal",
    "speed",
  ];

  let total = 0;
  let weightTotal = 0;

  for (const key of weights) {
    const weight = Math.max(0, task[key]);
    total += model.capabilities[key] * weight;
    weightTotal += weight;
  }

  const normalized =
    weightTotal > 0
      ? total / weightTotal
      : 0;

  return Number(normalized.toFixed(2));
}

export function getTaskFamily(
  agent: string,
  task: string,
): keyof TaskProfile {
  const normalizedAgent =
    agent.toLowerCase().trim();

  /*
   * Specialist agent identity is authoritative.
   *
   * Mission vocabulary must not reclassify a specialist agent.
   * Example: a Planning Agent mission containing the word
   * "implementation" must remain a planning task rather than
   * being incorrectly classified as coding.
   */
  if (
    normalizedAgent === "coding" ||
    normalizedAgent === "coding-agent"
  ) {
    return "coding";
  }

  if (
    normalizedAgent === "planning" ||
    normalizedAgent === "planning-agent"
  ) {
    return "planning";
  }

  if (
    normalizedAgent === "research" ||
    normalizedAgent === "research-agent"
  ) {
    return "research";
  }

  if (
    normalizedAgent === "reasoning" ||
    normalizedAgent === "reasoning-agent"
  ) {
    return "reasoning";
  }

  if (
    normalizedAgent === "browser" ||
    normalizedAgent === "browser-agent"
  ) {
    return "toolUse";
  }

  if (
    normalizedAgent === "sales" ||
    normalizedAgent === "sales-agent"
  ) {
    return "toolUse";
  }

  if (
    normalizedAgent === "copywriting" ||
    normalizedAgent === "copywriting-agent" ||
    normalizedAgent === "communication" ||
    normalizedAgent === "communication-agent" ||
    normalizedAgent === "marketing" ||
    normalizedAgent === "marketing-agent"
  ) {
    return "writing";
  }

  const text = `${agent} ${task}`.toLowerCase();

  if (
    /code|coding|debug|typescript|javascript|python|program|repository|repo|bug|compile|build|software|api|implementation|refactor|test/.test(text)
  ) {
    return "coding";
  }

  if (
    /research|investigate|analy[sz]e|compare|study|find|search|evidence|sources/.test(text)
  ) {
    return "research";
  }

  if (
    /plan|planning|strategy|architecture|design|decompose|roadmap|reason/.test(text)
  ) {
    return "planning";
  }

  if (
    /write|writing|copy|email|content|marketing|communication|rewrite/.test(text)
  ) {
    return "writing";
  }

  if (
    /browser|website|linkedin|reddit|x\b|gmail|click|navigate|post|tool|execute|automation/.test(text)
  ) {
    return "toolUse";
  }

  return "reasoning";
}

const SPECIALISTS: Record<
  keyof TaskProfile,
  string[]
> = {
  coding: [
    "moonshotai/kimi-k3",
    "qwen/qwen3.8-max-0902",
    "deepseek/deepseek-v4.1-flash",
  ],

  research: [
    "qwen/qwen3.8-max-0902",
    "moonshotai/kimi-k3",
    "deepseek/deepseek-v4.1-flash",
  ],

  planning: [
    "qwen/qwen3.8-max-0902",
    "moonshotai/kimi-k3",
    "deepseek/deepseek-v4.1-flash",
  ],

  writing: [
    "moonshotai/kimi-k3",
    "qwen/qwen3.8-max-0902",
    "deepseek/deepseek-v4.1-flash",
  ],

  toolUse: [
    "moonshotai/kimi-k3",
    "deepseek/deepseek-v4.1-flash",
    "qwen/qwen3.8-max-0902",
  ],

  reasoning: [
    "qwen/qwen3.8-max-0902",
    "moonshotai/kimi-k3",
    "deepseek/deepseek-v4.1-flash",
  ],

  multimodal: [
    "moonshotai/kimi-k3",
    "qwen/qwen3.8-max-0902",
    "deepseek/deepseek-v4.1-flash",
  ],

  longContext: [
    "moonshotai/kimi-k3",
    "qwen/qwen3.8-max-0902",
    "deepseek/deepseek-v4.1-flash",
  ],

  speed: [
    "deepseek/deepseek-v4.1-flash",
    "moonshotai/kimi-k3",
    "qwen/qwen3.8-max-0902",
  ],
};

export function selectModel(
  agent: string,
  task: string,
): string {
  return selectModelDecision(agent, task).model;
}

export function selectModelDecision(
  agent: string,
  task: string,
): ModelSelection {
  const profile = classifyTask(agent, task);
  const family = getTaskFamily(agent, task);

  const preferred =
    SPECIALISTS[family];

  const ranked = MODELS
    .map((model) => {
      const staticScore =
        score(model, profile);

      const adaptive =
        adaptiveModelScore(
          staticScore,
          model.id,
          family,
        );

      return {
        model,
        score: adaptive.score,
        staticScore,
        adaptive: adaptive.metrics,
        specialistRank:
          preferred.indexOf(model.id),
      };
    })
    .filter(
      (entry) =>
        entry.specialistRank >= 0,
    )
    .sort((a, b) => {
      return b.score - a.score;
    });

  const winner = ranked[0];

  if (!winner) {
    throw new Error(
      `No eligible model for task family: ${family}`,
    );
  }

  return {
    model: winner.model.id,
    family: winner.model.family,
    score: winner.score,
    reason:
      `Task classified as ${family}; ` +
      `selected using static capability plus ` +
      `observed performance, reliability, tool reliability, ` +
      `latency, and controlled exploration.`,
    alternatives: ranked
      .slice(1, 4)
      .map(
        (entry) =>
          entry.model.id,
      ),
  };
}

export function getModelCatalog(): ModelCandidate[] {
  return [...MODELS];
}

export function updateModelCatalog(
  discovered: ModelCandidate[],
): void {
  const certified = [...MODELS];
  const merged: ModelCandidate[] = [];

  for (const candidate of discovered) {
    if (!merged.some((model) => model.id === candidate.id)) {
      merged.push(candidate);
    }

    const baseline = certified.find(
      (model) => model.family === candidate.family,
    );

    if (
      baseline &&
      baseline.id !== candidate.id &&
      !merged.some((model) => model.id === baseline.id)
    ) {
      merged.push(baseline);
    }
  }

  for (const model of certified) {
    if (!merged.some((entry) => entry.id === model.id)) {
      merged.push(model);
    }
  }

  MODELS = merged;

  for (
    const family of Object.keys(SPECIALISTS) as (keyof TaskProfile)[]
  ) {
    const original = SPECIALISTS[family];
    const expanded: string[] = [];

    for (const preferredId of original) {
      const preferredFamily =
        preferredId.startsWith("qwen/")
          ? "qwen"
          : preferredId.startsWith("moonshotai/")
            ? "kimi"
            : preferredId.startsWith("deepseek/")
              ? "deepseek"
              : null;

      if (!preferredFamily) {
        continue;
      }

      for (
        const model of MODELS.filter(
          (candidate) => candidate.family === preferredFamily,
        )
      ) {
        if (!expanded.includes(model.id)) {
          expanded.push(model.id);
        }
      }
    }

    SPECIALISTS[family] = expanded;
  }
}


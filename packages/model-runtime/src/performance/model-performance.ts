import {
  getPerformance,
} from "./performance-store";

import {
  PerformanceTaskFamily,
} from "./performance-types";

export interface AdaptiveMetrics {
  observedQuality: number;
  reliability: number;
  toolReliability: number;
  latencyScore: number;
  explorationBonus: number;
  sampleCount: number;
}

export function adaptiveModelScore(
  staticScore: number,
  model: string,
  taskFamily: PerformanceTaskFamily,
): {
  score: number;
  metrics: AdaptiveMetrics;
} {
  const record =
    getPerformance(
      model,
      taskFamily,
    );

  if (!record || record.attempts === 0) {
    return {
      score:
        staticScore + 5,
      metrics: {
        observedQuality: 50,
        reliability: 0.5,
        toolReliability: 0.5,
        latencyScore: 50,
        explorationBonus: 5,
        sampleCount: 0,
      },
    };
  }

  const observedQuality =
    record.qualityEwma;

  const reliability =
    record.successEwma * 100;

  const toolReliability =
    record.toolSuccessEwma * 100;

  const latencyScore =
    record.latencyEwmaMs <= 0
      ? 50
      : Math.max(
          0,
          Math.min(
            100,
            100 -
              Math.log10(
                record.latencyEwmaMs,
              ) * 15,
          ),
        );

  /*
   * UCB-style exploration.
   *
   * Models with less evidence receive a larger
   * exploration bonus so a currently-unproven
   * model cannot be permanently excluded.
   */
  const explorationBonus =
    Math.min(
      15,
      Math.sqrt(
        (2 *
          Math.log(
            Math.max(
              2,
              record.attempts + 1,
            ),
          )) /
          Math.max(
            1,
            record.attempts,
          ),
      ) * 10,
    );

  const score =
    staticScore * 0.30 +
    observedQuality * 0.35 +
    reliability * 0.20 +
    toolReliability * 0.10 +
    latencyScore * 0.05 +
    explorationBonus;

  return {
    score: Number(
      score.toFixed(2),
    ),
    metrics: {
      observedQuality,
      reliability,
      toolReliability,
      latencyScore,
      explorationBonus,
      sampleCount:
        record.attempts,
    },
  };
}

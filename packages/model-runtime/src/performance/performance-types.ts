export type PerformanceTaskFamily =
  | "coding"
  | "reasoning"
  | "research"
  | "writing"
  | "planning"
  | "toolUse"
  | "multimodal"
  | "longContext"
  | "speed";

export interface ModelPerformanceRecord {
  version: 1;
  model: string;
  family: string;
  taskFamily: PerformanceTaskFamily;

  attempts: number;
  successes: number;
  failures: number;

  qualityEwma: number;
  successEwma: number;
  toolSuccessEwma: number;

  latencyEwmaMs: number;
  costEwmaUsd: number;

  lastScore: number;
  lastUpdated: string;
}

export interface ModelOutcome {
  model: string;
  family: string;
  taskFamily: PerformanceTaskFamily;

  success: boolean;

  quality?: number;
  toolSuccess?: number;

  latencyMs?: number;
  costUsd?: number;
}

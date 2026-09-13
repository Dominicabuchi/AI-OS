export type ValidationStatus =

  | "PASS"

  | "FAIL"

  | "WARNING"

  | "SKIPPED";

export interface ValidationStage {

  name: string;

  status: ValidationStatus;

  duration: number;

  message: string;

  details?: unknown;

}

export interface ValidationReport {

  platform: string;

  page: string;

  action: string;

  startedAt: number;

  finishedAt: number;

  stages: ValidationStage[];

}

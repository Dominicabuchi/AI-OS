import { HumanConfig } from "./types";

export const DEFAULT_HUMAN_CONFIG: HumanConfig = {
  defaultTimeout: 15000,
  defaultRetryAttempts: 4,
  defaultRetryDelay: 700,
  typingDelayMin: 75,
  typingDelayMax: 180,
  mouseMoveSteps: 24,
  actionPauseMin: 450,
  actionPauseMax: 1100,
  clickDelayMin: 90,
  clickDelayMax: 240,
  scrollStepMin: 120,
  scrollStepMax: 280,
  scrollPauseMin: 350,
  scrollPauseMax: 900
};

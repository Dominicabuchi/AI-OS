import { Locator, Page } from "playwright";

export interface WaitOptions {
  timeout?: number;
  state?: "attached" | "detached" | "visible" | "hidden";
}

export interface RetryOptions {
  attempts?: number;
  delay?: number;
  backoff?: number;
}

export interface TypeOptions {
  delay?: number;
  clear?: boolean;
}

export interface ClickOptions {
  timeout?: number;
  button?: "left" | "right" | "middle";
  clickCount?: number;
}

export interface HumanConfig {
  defaultTimeout: number;
  defaultRetryAttempts: number;
  defaultRetryDelay: number;
  typingDelayMin: number;
  typingDelayMax: number;
  mouseMoveSteps: number;
  actionPauseMin: number;
  actionPauseMax: number;
  clickDelayMin: number;
  clickDelayMax: number;
  scrollStepMin: number;
  scrollStepMax: number;
  scrollPauseMin: number;
  scrollPauseMax: number;
}

export interface StableElement {
  locator: Locator;
}

export interface HumanContext {
  page: Page;
}

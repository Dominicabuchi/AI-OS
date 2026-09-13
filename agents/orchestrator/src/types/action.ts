export type ActionType =
  | "browser.goto"
  | "browser.click"
  | "browser.type"
  | "browser.extract"
  | "memory.save"
  | "task.create"
  | "finish";

export interface Action {

  type: ActionType;

  payload: Record<string, unknown>;

}

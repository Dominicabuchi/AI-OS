export type MissionPolicy =
  | "once"
  | "scheduled"
  | "continuous";

export interface Mission {
  id: string;

  name: string;

  goal: string;

  policy: MissionPolicy;

  interval?: number;

  enabled: boolean;
}

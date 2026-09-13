import { Mission } from "@ai-os/shared";

export interface Runtime {

  observe(
    mission: Mission
  ): Promise<void>;

  think(
    mission: Mission
  ): Promise<any>;

  act(
    mission: Mission,
    plan: any
  ): Promise<void>;

  learn(
    mission: Mission
  ): Promise<void>;

}

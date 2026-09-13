import { Mission } from "@ai-os/shared";
import { AIRuntime } from "../runtime/ai-runtime";
import { Scheduler } from "@ai-os/scheduler-runtime";

export class Orchestrator {

  private runtime = new AIRuntime();

  private scheduler = new Scheduler();

  async run(
    mission: Mission
  ) {

    if (mission.policy === "once") {

      await this.runtime.run(
        mission
      );

      return;

    }

    this.scheduler.register({

      id: mission.id,

      enabled: mission.enabled,

      interval: mission.interval ?? 60000,

      run: async () => {

        await this.runtime.run(
          mission
        );

      }

    });

    this.scheduler.start();

  }

}

import { execute } from "@ai-os/execution-runtime";
import { Scheduler } from "@ai-os/scheduler-runtime";
import { Mission } from "@ai-os/shared";

export class MissionRuntime {

  private readonly scheduler = new Scheduler();

  register(
    mission: Mission
  ) {

    if (!mission.enabled)
      return;

    if (mission.policy === "once") {

      this.scheduler.register({
        id: mission.id,
        interval: 1,
        enabled: true,
        async run() {
          await execute({
            agentId: mission.agent,
            mission
          });
        }
      });

      return;

    }

    this.scheduler.register({
      id: mission.id,
      interval: mission.interval ?? 60000,
      enabled: true,
      async run() {
        await execute({
          agentId: mission.agent,
          mission
        });
      }
    });

  }

  start() {

    this.scheduler.start();

  }

}

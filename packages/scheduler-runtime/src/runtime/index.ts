import { Schedule } from "../types/schedule";

export class Scheduler {

  private schedules: Schedule[] = [];

  register(
    schedule: Schedule
  ) {

    schedule.running ??= false;

    this.schedules.push(schedule);

  }

  start() {

    for (const schedule of this.schedules) {

      setInterval(async () => {

        if (!schedule.enabled)
          return;

        if (schedule.running)
          return;

        schedule.running = true;

        try {

          await schedule.run();

        } finally {

          schedule.running = false;

        }

      }, schedule.interval);

    }

  }

}

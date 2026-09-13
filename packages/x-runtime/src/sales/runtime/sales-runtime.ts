import { QueueStore } from "../queue";
import { QueueRunner } from "../queue";
import { CampaignAnalyticsStore } from "../analytics";
import { StageMachine } from "../pipeline";
import { SalesService } from "../services";

export class SalesRuntime {

  readonly analytics =
    new CampaignAnalyticsStore();

  readonly stages =
    new StageMachine();

  readonly service: SalesService;

  constructor(
    readonly queue: QueueStore,
    readonly runner: QueueRunner,
  ) {

    this.service =
      new SalesService(
        this.stages,
        this.analytics,
        this.queue,
      );

  }

  async flush() {

    await this.runner.run();

  }

}

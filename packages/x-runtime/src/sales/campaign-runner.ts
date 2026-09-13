import { Campaign } from "./types";
import { Sequence } from "./sequence";
import { SequenceRunner } from "./sequence-runner";
import { QueueRunner } from "./queue/queue-runner";

export class CampaignRunner {

  constructor(
    private readonly sequences: SequenceRunner,
    private readonly queue: QueueRunner,
  ) {}

  async run(
    campaign: Campaign,
    sequence: Sequence,
  ) {

    for (const lead of campaign.leads) {

      await this.sequences.execute(
        lead,
        sequence,
        0,
      );

    }

    await this.queue.run();

  }

}

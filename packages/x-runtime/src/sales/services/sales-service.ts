import { Lead } from "../types";
import { StageMachine } from "../pipeline";
import { CampaignAnalyticsStore } from "../analytics";
import { QueueStore } from "../queue";

export class SalesService {

  constructor(
    private readonly pipeline: StageMachine,
    private readonly analytics: CampaignAnalyticsStore,
    private readonly queue: QueueStore,
  ) {}

  queued(
    campaignId: string,
    lead: Lead,
  ) {

    this.pipeline.contacted(lead);

    this.analytics.get(campaignId).queued++;

  }

  sent(
    campaignId: string,
  ) {

    this.analytics.get(campaignId).sent++;

  }

  replied(
    campaignId: string,
    lead: Lead,
  ) {

    this.pipeline.replied(lead);

    this.analytics.get(campaignId).replied++;

  }

  failed(
    campaignId: string,
  ) {

    this.analytics.get(campaignId).failed++;

  }

  queueSize() {

    return this.queue.size();

  }

}

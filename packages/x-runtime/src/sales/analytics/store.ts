import { CampaignMetrics } from "./types";

export class CampaignAnalyticsStore {

  private readonly metrics =
    new Map<string, CampaignMetrics>();

  get(
    campaignId: string,
  ): CampaignMetrics {

    let metric =
      this.metrics.get(campaignId);

    if (!metric) {

      metric = {

        campaignId,

        queued: 0,

        sent: 0,

        replied: 0,

        failed: 0,

        qualified: 0,

        won: 0,

        lost: 0,

      };

      this.metrics.set(
        campaignId,
        metric,
      );

    }

    return metric;

  }

  all() {
    return [...this.metrics.values()];
  }

}

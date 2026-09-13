import fs from "node:fs";
import path from "node:path";

import { CampaignMetrics } from "./types";

export class CampaignAnalyticsStore {

  private readonly file =
    process.env.AI_OS_SALES_ANALYTICS_STORE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "sales",
      "analytics.json"
    );

  constructor() {

    this.ensure();

  }

  private ensure(): void {

    fs.mkdirSync(
      path.dirname(this.file),
      {
        recursive: true
      }
    );

    if (!fs.existsSync(this.file)) {

      fs.writeFileSync(
        this.file,
        "[]\n",
        "utf8"
      );

    }

  }

  private load():
    CampaignMetrics[] {

    this.ensure();

    try {

      const parsed =
        JSON.parse(
          fs.readFileSync(
            this.file,
            "utf8"
          )
        );

      return Array.isArray(parsed)
        ? parsed as CampaignMetrics[]
        : [];

    } catch {

      return [];

    }

  }

  private persist(
    metrics: CampaignMetrics[]
  ): void {

    this.ensure();

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        metrics,
        null,
        2
      ) + "\n",
      "utf8"
    );

  }

  private proxy(
    metric: CampaignMetrics
  ): CampaignMetrics {

    return new Proxy(
      metric,
      {
        set: (
          target,
          property,
          value
        ) => {

          Reflect.set(
            target,
            property,
            value
          );

          const metrics =
            this.load();

          const index =
            metrics.findIndex(
              item =>
                item.campaignId ===
                target.campaignId
            );

          if (index >= 0) {

            metrics[index] = {
              ...target
            };

          } else {

            metrics.push({
              ...target
            });

          }

          this.persist(metrics);

          return true;

        }
      }
    );

  }

  get(
    campaignId: string,
  ): CampaignMetrics {

    const metrics =
      this.load();

    let metric =
      metrics.find(
        item =>
          item.campaignId ===
          campaignId
      );

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

      metrics.push(metric);

      this.persist(metrics);

    }

    return this.proxy(
      metric
    );

  }

  all() {

    return this.load().map(
      metric =>
        this.proxy(metric)
    );

  }

}

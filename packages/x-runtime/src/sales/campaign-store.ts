import fs from "node:fs";
import path from "node:path";

import {
  Campaign,
  Lead
} from "./types";

export class CampaignStore {

  private readonly file =
    process.env.AI_OS_SALES_CAMPAIGNS_STORE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "sales",
      "campaigns.json"
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

  private load(): Campaign[] {

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
        ? parsed as Campaign[]
        : [];

    } catch {

      return [];

    }

  }

  private persist(
    campaigns: Campaign[]
  ): void {

    this.ensure();

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        campaigns,
        null,
        2
      ) + "\n",
      "utf8"
    );

  }

  private proxyLead(
    campaignId: string,
    lead: Lead
  ): Lead {

    return new Proxy(
      lead,
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

          const campaigns =
            this.load();

          const campaign =
            campaigns.find(
              item =>
                item.id === campaignId
            );

          const storedLead =
            campaign?.leads.find(
              item =>
                item.id === target.id
            );

          if (storedLead) {

            Object.assign(
              storedLead,
              target
            );

            this.persist(
              campaigns
            );

          }

          return true;

        }
      }
    );

  }

  private proxyCampaign(
    campaign: Campaign
  ): Campaign {

    return {
      ...campaign,
      leads:
        campaign.leads.map(
          lead =>
            this.proxyLead(
              campaign.id,
              lead
            )
        )
    };

  }

  add(
    campaign: Campaign
  ) {

    const campaigns =
      this.load();

    const index =
      campaigns.findIndex(
        item =>
          item.id === campaign.id
      );

    if (index >= 0) {

      campaigns[index] =
        campaign;

    } else {

      campaigns.push(
        campaign
      );

    }

    this.persist(
      campaigns
    );

  }

  get(
    id: string
  ) {

    const campaign =
      this.load().find(
        item =>
          item.id === id
      );

    return campaign
      ? this.proxyCampaign(
          campaign
        )
      : undefined;

  }

  all() {

    return this.load().map(
      campaign =>
        this.proxyCampaign(
          campaign
        )
    );

  }

}

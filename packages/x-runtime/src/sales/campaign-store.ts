import { Campaign } from "./types";

export class CampaignStore {

  private readonly campaigns =
    new Map<string, Campaign>();

  add(campaign: Campaign) {
    this.campaigns.set(
      campaign.id,
      campaign
    );
  }

  get(id: string) {
    return this.campaigns.get(id);
  }

  all() {
    return [...this.campaigns.values()];
  }

}

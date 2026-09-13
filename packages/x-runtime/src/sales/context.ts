import { LeadStore } from "./lead-store";
import { CampaignStore } from "./campaign-store";

export class SalesContext {

  readonly leads =
    new LeadStore();

  readonly campaigns =
    new CampaignStore();

}

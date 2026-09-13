import { Lead } from "./types";

export class LeadQualifier {

  qualify(
    lead: Lead,
  ) {

    return lead.score >= 50;

  }

}

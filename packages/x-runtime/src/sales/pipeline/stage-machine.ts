import { Lead, LeadStage } from "../types";

export class StageMachine {

  contacted(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Contacted;
    lead.lastContact = new Date().toISOString();

  }

  replied(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Replied;

  }

  interested(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Interested;

  }

  qualified(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Qualified;

  }

  negotiating(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Negotiating;

  }

  won(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Won;

  }

  lost(
    lead: Lead,
  ) {

    lead.stage = LeadStage.Lost;

  }

}
